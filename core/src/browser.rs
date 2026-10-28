use std::process::Command;

pub enum BrowserKind {
    Chromium,
    Chrome,
    Brave,
    Edge,
    Unknown,
}

pub struct BrowserInfo {
    pub path: String,
    pub kind: BrowserKind,
    pub version: String,
}

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
    ];

    let mut failures: Vec<String> = Vec::new();

    for (browser_cmd, kind) in browsers {
        match Command::new(browser_cmd).arg("--version").output() {
            Err(e) => {
                if e.kind() == std::io::ErrorKind::NotFound {
                    continue;
                } else {
                    failures.push(format!("{browser_cmd}: error al ejecutar: {e}"));
                    continue;
                }
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
                            path: browser_cmd.to_string(),
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
