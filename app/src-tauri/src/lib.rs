// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Manager, State};

#[tauri::command]
fn browser_status(custom_path: Option<String>) -> Result<epoch_core::browser::BrowserInfo, String> {
    epoch_core::browser::detect_browser(&custom_path.unwrap_or_else(|| "".into()))
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_snapshots(
    db: State<'_, epoch_core::db::Db>,
) -> Result<Vec<epoch_core::db::SnapshotSummary>, String> {
    db.list_all_snapshots().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_snapshot(
    db: State<'_, epoch_core::db::Db>,
    id: i64,
) -> Result<Option<epoch_core::db::Snapshot>, String> {
    db.get_by_id(id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_snapshot(db: State<'_, epoch_core::db::Db>, id: i64) -> Result<(), String> {
    db.delete_snapshot(id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn capture_url(
    db: State<'_, epoch_core::db::Db>,
    url: String,
    custom_path: Option<String>,
) -> Result<i64, String> {
    let info = epoch_core::browser::detect_browser(&custom_path.unwrap_or_else(|| "".into()))
        .map_err(|e| e.to_string())?;
    let html = epoch_core::browser::fetch_html(&info, &url)
        .await
        .map_err(|e| e.to_string())?;

    let service = epoch_core::capture::CaptureService::new(db.inner().clone());
    service
        .capture(&url, &html)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn can_self_update() -> bool {
    // Devuelve false si el os es linux y no se está ejecutando como AppImage, de lo contrario devuelve true
    !cfg!(target_os = "linux") || std::env::var("APPIMAGE").is_ok()
}

#[tauri::command]
fn relaunch(app: tauri::AppHandle) {
    app.restart();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let db = tauri::async_runtime::block_on(epoch_core::db::Db::init())?;
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            browser_status,
            list_snapshots,
            get_snapshot,
            capture_url,
            delete_snapshot,
            can_self_update,
            relaunch
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
