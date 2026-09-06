import {
  DASHBOARD_SECTION_IDS,
  type DashboardSectionId,
} from "~/lib/dashboard/sections";

export type SectionBackdropOrb = {
  className: string;
};

export type SectionBackdropConfig = {
  orbs: SectionBackdropOrb[];
  wash?: string;
};

export const SECTION_PANEL_ACCENT_CONFIG: Record<
  DashboardSectionId,
  SectionBackdropConfig
> = {
  [DASHBOARD_SECTION_IDS.repository]: {
    orbs: [
      {
        className:
          "absolute -left-10 -top-12 h-40 w-56 rounded-full bg-violet-500/14 blur-3xl",
      },
      {
        className:
          "absolute right-0 top-0 h-28 w-36 rounded-full bg-fuchsia-500/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 58%)",
  },
  [DASHBOARD_SECTION_IDS.overview]: {
    orbs: [
      {
        className:
          "absolute left-1/3 -top-8 h-36 w-52 rounded-full bg-indigo-400/12 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, transparent 50%)",
  },
  [DASHBOARD_SECTION_IDS.analytics]: {
    orbs: [
      {
        className:
          "absolute -left-6 top-0 h-44 w-48 rounded-full bg-blue-500/10 blur-3xl",
      },
      {
        className:
          "absolute right-8 top-6 h-32 w-40 rounded-full bg-violet-400/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, transparent 55%)",
  },
  [DASHBOARD_SECTION_IDS.activity]: {
    orbs: [
      {
        className:
          "absolute left-1/4 -top-10 h-40 w-64 rounded-full bg-emerald-400/10 blur-3xl",
      },
      {
        className:
          "absolute right-1/4 top-8 h-28 w-44 rounded-full bg-teal-400/8 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(52, 211, 153, 0.035) 0%, transparent 52%)",
  },
  [DASHBOARD_SECTION_IDS.recent]: {
    orbs: [
      {
        className:
          "absolute -right-4 -top-6 h-36 w-48 rounded-full bg-rose-400/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(244, 114, 182, 0.035) 0%, transparent 48%)",
  },
  [DASHBOARD_SECTION_IDS.pipeline]: {
    orbs: [
      {
        className:
          "absolute left-0 top-0 h-36 w-56 rounded-full bg-sky-400/10 blur-3xl",
      },
      {
        className:
          "absolute right-12 bottom-0 h-24 w-32 rounded-full bg-cyan-400/8 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(56, 189, 248, 0.04) 0%, transparent 54%)",
  },
  [DASHBOARD_SECTION_IDS.tracker]: {
    orbs: [
      {
        className:
          "absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-slate-300/8 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(148, 163, 184, 0.03) 0%, transparent 45%), radial-gradient(circle at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 42%)",
  },
  [DASHBOARD_SECTION_IDS.dataFiles]: {
    orbs: [
      {
        className:
          "absolute right-0 -top-8 h-32 w-44 rounded-full bg-purple-400/9 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(168, 85, 247, 0.03) 0%, transparent 46%)",
  },
  [DASHBOARD_SECTION_IDS.funnel]: {
    orbs: [
      {
        className:
          "absolute left-8 -top-6 h-32 w-48 rounded-full bg-amber-400/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(251, 191, 36, 0.04) 0%, transparent 50%)",
  },
  [DASHBOARD_SECTION_IDS.reports]: {
    orbs: [
      {
        className:
          "absolute -left-4 top-4 h-36 w-52 rounded-full bg-fuchsia-400/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(217, 70, 239, 0.04) 0%, transparent 48%)",
  },
  [DASHBOARD_SECTION_IDS.outputs]: {
    orbs: [
      {
        className:
          "absolute right-6 top-2 h-28 w-40 rounded-full bg-cyan-400/10 blur-3xl",
      },
    ],
    wash: "linear-gradient(180deg, rgba(34, 211, 238, 0.04) 0%, transparent 48%)",
  },
};

export function getSectionPanelAccent(
  sectionId: DashboardSectionId,
): SectionBackdropConfig {
  return SECTION_PANEL_ACCENT_CONFIG[sectionId];
}
