use sqlx::sqlite::{SqliteConnectOptions, SqlitePool, SqlitePoolOptions};
use std::path::Path;

#[derive(Debug, thiserror::Error)]
pub enum DbError {
    // This error is used to wrap any IO errors that occur when creating the database file or its parent directories.
    #[error("io: {0}")]
    Io(#[from] std::io::Error),
    // This error is used to wrap any errors that occur when interacting with the SQLite database using sqlx.
    #[error("sqlx: {0}")]
    Sqlx(#[from] sqlx::Error),
    // This error is used to wrap any errors that occur when running database migrations using sqlx.
    #[error("migrate: {0}")]
    Migrate(#[from] sqlx::migrate::MigrateError),
}

pub struct Db {
    pool: SqlitePool,
}

impl Db {
    pub async fn open(path: &Path) -> Result<Self, DbError> {
        // 1
        Self::ensure_path(path)?;
        // 2
        let options = SqliteConnectOptions::new()
            .filename(path)
            .create_if_missing(true);
        // 3
        let pool = SqlitePoolOptions::new()
            .max_connections(1)
            .connect_with(options)
            .await?;
        // 4
        sqlx::migrate!("./migrations").run(&pool).await?;
        // 5
        Ok(Self { pool })
    }
    fn ensure_path(path: &Path) -> Result<(), DbError> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(DbError::Io)?;
        }
        Ok(())
    }

    pub async fn list_by_url(&self, url: &str) -> Result<Vec<SnapshotSummary>, DbError> {
        let snapshot = sqlx::query_as::<_, SnapshotSummary>(
            "SELECT id, url, title, captured_at FROM snapshots WHERE url = ? ORDER BY captured_at DESC, id DESC",
        )
        .bind(url)
        .fetch_all(&self.pool)
        .await?;
        Ok(snapshot)
    }

    pub async fn get_by_id(&self, id: i64) -> Result<Option<Snapshot>, DbError> {
        let snapshot = sqlx::query_as::<_, Snapshot>(
            "SELECT id, url, title, html_content, captured_at FROM snapshots WHERE id = ?",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(snapshot)
    }

    pub async fn insert_snapshot(
        &self,
        url: &str,
        title: Option<&str>,
        html_content: &str,
    ) -> Result<i64, DbError> {
        let result =
            sqlx::query("INSERT INTO snapshots (url, title, html_content) VALUES (?, ?, ?)")
                .bind(url)
                .bind(title)
                .bind(html_content)
                .execute(&self.pool)
                .await?;

        Ok(result.last_insert_rowid())
    }
}

#[derive(Debug, sqlx::FromRow)]
pub struct Snapshot {
    pub id: i64,
    pub url: String,
    pub title: Option<String>,
    pub html_content: String,
    pub captured_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct SnapshotSummary {
    pub id: i64,
    pub url: String,
    pub title: Option<String>,
    pub captured_at: chrono::DateTime<chrono::Utc>,
}
