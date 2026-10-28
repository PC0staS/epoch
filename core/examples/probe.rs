#[tokio::main]
async fn main() {
    let info = epoch_core::browser::detect_browser("").expect("no hay navegador");
    println!("navegador: {info:?}");

    let html = epoch_core::browser::fetch_html(&info, "https://example.com")
        .await
        .expect("fetch falló");
    println!("len={}", html.len());
}
