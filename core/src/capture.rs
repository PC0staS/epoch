use lol_html::errors::RewritingError;

use crate::{
    db::{Db, DbError},
    html::extract_title,
};

// Usamos un enum para wrapear los posibles errores que puedan ocurrir, así la función devuelve CaptureError y no necesitamos preocuparnos por los detalles de cada error individual.
#[derive(Debug, thiserror::Error)]
pub enum CaptureError {
    #[error(transparent)]
    Db(#[from] DbError),
    #[error(transparent)]
    Rewrite(#[from] RewritingError),
    #[error(transparent)]
    Url(#[from] url::ParseError),
}

pub struct CaptureService {
    db: Db,
}
impl CaptureService {
    pub fn new(db: Db) -> Self {
        Self { db }
    }

    pub async fn capture(&self, url: &str, html_content: &str) -> Result<i64, CaptureError> {
        let base_url = url::Url::parse(url)?; // ? → CaptureError::Url
        let html = crate::html::absolutize_html(html_content, &base_url)?; // ? → CaptureError::Rewrite
        let title = extract_title(html_content);
        let id = self
            .db
            .insert_snapshot(url, title.as_deref(), &html)
            .await?; // ? → CaptureError::Db
        Ok(id)
    }
}
