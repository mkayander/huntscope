export type HuntscopeGridCell = {
  col: 0 | 1 | 2;
  row: 0 | 1 | 2;
  fill: string;
  opacity?: number;
};

/** 3×3 grid forming letter H — bright side columns + crossbar, recessed mid top/bottom. */
export const HUNTSCOPE_H_GRID: HuntscopeGridCell[] = [
  { col: 0, row: 0, fill: "#c4b5fd" },
  { col: 1, row: 0, fill: "#120828", opacity: 0.5 },
  { col: 2, row: 0, fill: "#c4b5fd" },
  { col: 0, row: 1, fill: "#ddd6fe" },
  { col: 1, row: 1, fill: "#ffffff" },
  { col: 2, row: 1, fill: "#ddd6fe" },
  { col: 0, row: 2, fill: "#a78bfa" },
  { col: 1, row: 2, fill: "#120828", opacity: 0.5 },
  { col: 2, row: 2, fill: "#a78bfa" },
];

export const HUNTSCOPE_GRID = {
  cellSize: 32,
  gap: 6,
  radius: 8,
} as const;

export function getHuntscopeGridOrigin(totalCells = 3) {
  const span =
    totalCells * HUNTSCOPE_GRID.cellSize +
    (totalCells - 1) * HUNTSCOPE_GRID.gap;
  return -span / 2;
}

export function getHuntscopeGridCellPosition(col: number, row: number) {
  const origin = getHuntscopeGridOrigin();
  const step = HUNTSCOPE_GRID.cellSize + HUNTSCOPE_GRID.gap;
  return {
    x: origin + col * step,
    y: origin + row * step,
  };
}

export const HUNTSCOPE_IRIS_BLADE_PATH =
  "M -10,-132 L 10,-132 L 88,-36 L 88,36 L 10,132 L -10,132 Z";

export const HUNTSCOPE_IRIS_ROTATIONS = [0, 60, 120, 180, 240, 300];
