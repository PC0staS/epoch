use lol_html::RewriteStrSettings;
use lol_html::element;
use lol_html::rewrite_str;
use lol_html::text;
use lol_html::{errors::RewritingError, html_content::Element};
use url::Url;

fn rewrite_attribute(element: &mut Element, attribute: &str, base: &Url) {
    if let Some(value) = element.get_attribute(attribute) {
        // 'Url::join' no es una suma de cadenas, sino que resuelve la URL relativa contra la base, manejando correctamente los casos de rutas relativas y absolutas.
        if let Ok(absolute) = base.join(&value) {
            let _ = element.set_attribute(attribute, absolute.as_str());
        }
    }
}

pub fn absolutize_html(html: &str, base: &Url) -> Result<String, RewritingError> {
    rewrite_str(
        html,
        RewriteStrSettings::new()
            .append_element_content_handler(element!("a[href]", |el| {
                rewrite_attribute(el, "href", base);
                Ok(())
            }))
            .append_element_content_handler(element!("img[src]", |el| {
                rewrite_attribute(el, "src", base);
                Ok(())
            }))
            .append_element_content_handler(element!("link[href]", |el| {
                rewrite_attribute(el, "href", base);
                Ok(())
            }))
            .append_element_content_handler(element!("script[src]", |el| {
                rewrite_attribute(el, "src", base);
                Ok(())
            }))
            .append_element_content_handler(element!("iframe[src]", |el| {
                rewrite_attribute(el, "src", base);
                Ok(())
            }))
            .append_element_content_handler(element!("form[action]", |el| {
                rewrite_attribute(el, "action", base);
                Ok(())
            }))
            .with_strict(false),
    )
}
pub fn extract_title(html: &str) -> Option<String> {
    let mut title = String::new();

    let _ = rewrite_str(
        html,
        RewriteStrSettings::new().append_element_content_handler(text!("title", |chunk| {
            title.push_str(chunk.as_str());
            Ok(())
        })),
    );

    if title.is_empty() { None } else { Some(title) }
}
