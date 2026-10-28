#[tokio::main]
async fn main() {
    let info = epoch_core::browser::detect_browser("").expect("no hay navegador");
    println!("navegador: {info:?}");

    let html = epoch_core::browser::fetch_html(&info, "https://pablocostas.dev")
        .await
        .expect("fetch falló");
    println!("len={}", html.len());
    println!("--- primeros 500 ---");
    println!("{}", &html.chars().take(500).collect::<String>());

    if let Some(i) = html.find("ERR_") {
        println!("error: {}", &html[i..(i + 40).min(html.len())]);
    }
    println!("url final: {:?}", info.path);
}
