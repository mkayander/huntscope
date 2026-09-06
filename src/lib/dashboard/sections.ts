export const DASHBOARD_SECTION_IDS = {
  repository: "dashboard-repository",
  overview: "dashboard-overview",
  analytics: "dashboard-analytics",
  funnel: "dashboard-funnel",
  activity: "dashboard-activity",
  recent: "dashboard-recent",
  reports: "dashboard-reports",
  pipeline: "dashboard-pipeline",
  tracker: "dashboard-tracker",
  outputs: "dashboard-outputs",
  dataFiles: "dashboard-data-files",
} as const;

export type DashboardSectionId =
  (typeof DASHBOARD_SECTION_IDS)[keyof typeof DASHBOARD_SECTION_IDS];

export const DASHBOARD_SECTION_SCROLL_OFFSET = 112;
