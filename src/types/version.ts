export interface AppVersionInfo {
  version: string;
  commitSha: string;
  message: string;
  date: string;
  author: string;
  url?: string;
  isCurrent?: boolean;
}

export interface JustUpdatedNotification {
  version: string;
  message: string;
  date: string;
}
