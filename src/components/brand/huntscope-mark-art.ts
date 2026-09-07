export type HuntscopeGridCell = {
  col: 0 | 1 | 2;
  row: 0 | 1 | 2;
  fill: string;
  opacity?: number;
};

/** 3×3 grid forming letter H — all squares visible; mid top/bottom are darker purple. */
export const HUNTSCOPE_H_GRID: HuntscopeGridCell[] = [
  { col: 0, row: 0, fill: "#c4b5fd" },
  { col: 1, row: 0, fill: "#4c1d95" },
  { col: 2, row: 0, fill: "#c4b5fd" },
  { col: 0, row: 1, fill: "#ddd6fe" },
  { col: 1, row: 1, fill: "#ffffff" },
  { col: 2, row: 1, fill: "#ddd6fe" },
  { col: 0, row: 2, fill: "#a78bfa" },
  { col: 1, row: 2, fill: "#4c1d95" },
  { col: 2, row: 2, fill: "#a78bfa" },
];

export const HUNTSCOPE_GRID = {
  sideCellSize: 28,
  centerCellSize: 40,
  gap: 5,
  sideRadius: 7,
  centerRadius: 8,
} as const;

const COL_WIDTHS = [
  HUNTSCOPE_GRID.sideCellSize,
  HUNTSCOPE_GRID.centerCellSize,
  HUNTSCOPE_GRID.sideCellSize,
] as const;

const ROW_HEIGHTS = [
  HUNTSCOPE_GRID.sideCellSize,
  HUNTSCOPE_GRID.centerCellSize,
  HUNTSCOPE_GRID.sideCellSize,
] as const;

export function getHuntscopeGridSpan() {
  const { gap } = HUNTSCOPE_GRID;
  const width =
    COL_WIDTHS.reduce((sum, size) => sum + size, 0) +
    gap * (COL_WIDTHS.length - 1);
  const height =
    ROW_HEIGHTS.reduce((sum, size) => sum + size, 0) +
    gap * (ROW_HEIGHTS.length - 1);

  return { width, height };
}

export function getHuntscopeGridOrigin() {
  const { width, height } = getHuntscopeGridSpan();
  return { x: -width / 2, y: -height / 2 };
}

export function getHuntscopeGridCellBounds(col: number, row: number) {
  const { gap, sideRadius, centerRadius } = HUNTSCOPE_GRID;
  const { x: originX, y: originY } = getHuntscopeGridOrigin();

  let x = originX;
  for (let c = 0; c < col; c++) {
    x += COL_WIDTHS[c]! + gap;
  }

  let y = originY;
  for (let r = 0; r < row; r++) {
    y += ROW_HEIGHTS[r]! + gap;
  }

  const width = COL_WIDTHS[col]!;
  const height = ROW_HEIGHTS[row]!;
  const radius = col === 1 || row === 1 ? centerRadius : sideRadius;

  return { x, y, width, height, radius };
}

export const HUNTSCOPE_IRIS_BLADE_PATH =
  "M -10,-132 L 10,-132 L 88,-36 L 88,36 L 10,132 L -10,132 Z";

export const HUNTSCOPE_IRIS_ROTATIONS = [0, 60, 120, 180, 240, 300];
