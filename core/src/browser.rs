use chromiumoxide::{Browser, BrowserConfig};
use futures::StreamExt;
use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;

const CAPTURE_TIMEOUT: Duration = Duration::from_secs(60); // Timeout para capturar la página
const SETTLE: Duration = Duration::from_millis(1000); // Tiempo de espera para que la página se estabilice antes de capturar el HTML

#[derive(Debug)]
pub enum BrowserKind {
    Chromium,
    Chrome,
    Brave,
    Edge,
    Unknown,
}

#[derive(Debug)]
pub struct BrowserInfo {
    pub path: String,
    pub kind: BrowserKind,
    pub version: String,
}

#[derive(Debug, thiserror::Error)]
pub enum BrowserError {
    #[error("no se pudo lanzar el navegador: {0}")]
    Launch(String),
    #[error("error CDP: {0}")]
    Cdp(#[from] chromiumoxide::error::CdpError),
    #[error("timeout de {secs}s capturando {url}")]
    Timeout { url: String, secs: u64 },
}

#[derive(Debug)]
pub enum DetectError {
    BrowserNotFound,
    NoUsableBrowser(Vec<String>),
}

pub fn detect_browser(custom_browser: &str) -> Result<BrowserInfo, DetectError> {
    let browsers = vec![
        (custom_browser, BrowserKind::Chromium), // Intentamos primero con el path personalizado proporcionado
        ("chromium", BrowserKind::Chromium),
        ("chromium-browser", BrowserKind::Chromium),
        ("google-chrome", BrowserKind::Chrome),
        ("google-chrome-stable", BrowserKind::Chrome),
        ("microsoft-edge-stable", BrowserKind::Edge),
        ("microsoft-edge", BrowserKind::Edge),
        ("brave-browser", BrowserKind::Brave),
        ("brave", BrowserKind::Brave),
    ];

    let mut failures: Vec<String> = Vec::new();

    for (browser_cmd, kind) in browsers {
        let Some(path) = resolve_in_path(browser_cmd) else {
            continue; // Si no se encuentra el navegador, pasamos al siguiente
        };
        match Command::new(&path).arg("--version").output() {
            Err(e) => {
                failures.push(format!("{browser_cmd}: error al ejecutar: {e}"));
                continue;
            }

            Ok(out) if !out.status.success() => {
                failures.push(format!("{browser_cmd}: exit {:?}", out.status.code()));
                continue;
            }

            Ok(out) => {
                let raw = if out.stdout.is_empty() {
                    String::from_utf8_lossy(&out.stderr)
                } else {
                    String::from_utf8_lossy(&out.stdout)
                };
                match parse_version(&raw) {
                    Some(version) => {
                        return Ok(BrowserInfo {
                            path: path.display().to_string(),
                            kind,
                            version,
                        });
                    }
                    None => {
                        failures.push(format!("{browser_cmd}: sin versión en {raw:?}"));
                        continue;
                    }
                };
            }
        }
    }
    if failures.is_empty() {
        Err(DetectError::BrowserNotFound)
    } else {
        Err(DetectError::NoUsableBrowser(failures))
    }
}

fn parse_version(version_str: &str) -> Option<String> {
    version_str
        .split_whitespace() // Divide la cadena de versión en partes separadas por espacios.
        .find(|part| part.starts_with(|c: char| c.is_ascii_digit())) // Busca la primera parte que comienza con un dígito, que debería ser la versión.
        .map(str::to_string) // Devuelve la primera parte que comienza con un dígito, que debería ser la versión.
}

fn resolve_in_path(cmd: &str) -> Option<PathBuf> {
    let path = std::env::var_os("PATH")?;
    for dir in std::env::split_paths(&path) {
        let candidate = dir.join(cmd);
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

pub async fn fetch_html(browser_info: &BrowserInfo, url: &str) -> Result<String, BrowserError> {
    let config = BrowserConfig::builder()
        .chrome_executable(&browser_info.path)
        .build()
        .map_err(BrowserError::Launch)?;

    //las instrucciones se le dan al browser y se reciven eventos de vuelta en el handler.
    let (mut browser, mut handler) = Browser::launch(config).await?;

    let handle = tokio::spawn(async move {
        while let Some(event) = handler.next().await {
            if event.is_err() {
                break;
            }
        }
    });

    let result = tokio::time::timeout(CAPTURE_TIMEOUT, async {
        let page = browser.new_page(url).await?;
        tokio::time::sleep(SETTLE).await;
        let page_html = page.content().await?;
        Ok::<String, chromiumoxide::error::CdpError>(page_html)
    })
    .await;

    // Cerramos el navegador y esperamos a que el manejador termine
    let _ = browser.close().await;
    let _ = handle.await;

    match result {
        Ok(Ok(html)) => Ok(html),
        Ok(Err(e)) => Err(e.into()),
        Err(_) => Err(BrowserError::Timeout {
            url: url.to_string(),
            secs: CAPTURE_TIMEOUT.as_secs(),
        }),
    }
}
