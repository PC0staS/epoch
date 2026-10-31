export type BrowserKind = "Chromium" | "Chrome" | "Brave" | "Edge" | "Unknown";

export interface BrowserInfo {
  path: string;
  kind: BrowserKind;
  version: string;
}

export interface SnapshotSummary {
  id: number;
  url: string;
  title: string | null;
  captured_at: string;
}

export interface Snapshot {
  id: number;
  url: string;
  title: string | null;
  html_content: string;
  captured_at: string;
}
