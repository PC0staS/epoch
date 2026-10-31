import { invoke } from "@tauri-apps/api/core";
import { BrowserInfo, Snapshot, SnapshotSummary } from "./models";

export const listSnapshots = () => invoke<SnapshotSummary[]>("list_snapshots");
export const browserStatus = (customPath?: string) => invoke<BrowserInfo>("browser_status", { customPath });
export const getSnapshot = (id: number) => invoke<Snapshot | null>("get_snapshot", { id });
export const deleteSnapshot = (id: number) => invoke<void>("delete_snapshot", { id });
export const captureUrl = (url: string, customPath?: string) => invoke<number>("capture_url", { url, customPath });
