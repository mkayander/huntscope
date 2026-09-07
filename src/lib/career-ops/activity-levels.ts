export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export function countToActivityLevel(
  count: number,
  maxCount: number,
): ActivityLevel {
  if (count <= 0) {
    return 0;
  }

  if (maxCount <= 1) {
    return 1;
  }

  const ratio = count / maxCount;
  if (ratio <= 0.25) {
    return 1;
  }

  if (ratio <= 0.5) {
    return 2;
  }

  if (ratio <= 0.75) {
    return 3;
  }

  return 4;
}

export const ACTIVITY_LEVEL_CLASS_NAMES: Record<ActivityLevel, string> = {
  0: "bg-white/8 ring-1 ring-white/5",
  1: "bg-violet-900/70 ring-1 ring-violet-800/40",
  2: "bg-violet-700/75 ring-1 ring-violet-600/40",
  3: "bg-violet-500/85 ring-1 ring-violet-400/40",
  4: "bg-violet-300 ring-1 ring-violet-200/50",
};
