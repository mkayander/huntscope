export const DASHBOARD_SECTION_IDS = {
  repository: "dashboard-repository",
  overview: "dashboard-overview",
  analytics: "dashboard-analytics",
  activity: "dashboard-activity",
  recent: "dashboard-recent",
  pipeline: "dashboard-pipeline",
  tracker: "dashboard-tracker",
  dataFiles: "dashboard-data-files",
} as const;

export type DashboardSectionId =
  (typeof DASHBOARD_SECTION_IDS)[keyof typeof DASHBOARD_SECTION_IDS];

export const DASHBOARD_SECTION_SCROLL_OFFSET = 112;
