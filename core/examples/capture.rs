use epoch_core::{
    browser::{detect_browser, fetch_html},
    capture::CaptureService,
    db::Db,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "https://pablocostas.dev".to_string());

    let db = Db::init().await?;
    let service = CaptureService::new(db);

    let info = detect_browser("").expect("no hay navegador");
    println!("navegador: {info:?}");

    let html = fetch_html(&info, &url).await?;
    println!("html descargado: {} bytes", html.len());

    let id = service.capture(&url, &html).await?;
    println!("snapshot guardado con id {id}");

    Ok(())
}
