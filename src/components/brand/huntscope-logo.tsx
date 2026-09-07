import type { SVGProps } from "react";

import {
  getHuntscopeGridCellPosition,
  HUNTSCOPE_GRID,
  HUNTSCOPE_H_GRID,
  HUNTSCOPE_IRIS_BLADE_PATH,
  HUNTSCOPE_IRIS_ROTATIONS,
} from "~/components/brand/huntscope-mark-art";
import { cn } from "~/lib/utils";

type HuntscopeLogoProps = SVGProps<SVGSVGElement> & {
  variant?: "full" | "simple";
  withBackground?: boolean;
};

function HuntscopeGrid({
  scale = 1,
  idPrefix = "hs",
}: {
  scale?: number;
  idPrefix?: string;
}) {
  const { cellSize, radius } = HUNTSCOPE_GRID;

  return (
    <g filter={`url(#${idPrefix}-grid-glow)`}>
      {HUNTSCOPE_H_GRID.map((cell) => {
        const { x, y } = getHuntscopeGridCellPosition(cell.col, cell.row);
        return (
          <rect
            key={`${cell.col}-${cell.row}`}
            x={x * scale}
            y={y * scale}
            width={cellSize * scale}
            height={cellSize * scale}
            rx={radius * scale}
            fill={cell.fill}
            opacity={cell.opacity}
          />
        );
      })}
    </g>
  );
}

function HuntscopeReticle({
  scale = 1,
  withIris = true,
  idPrefix = "hs",
}: {
  scale?: number;
  withIris?: boolean;
  idPrefix?: string;
}) {
  const ringRadius = 198 * scale;
  const tabW = 32 * scale;
  const tabH = 52 * scale;
  const tabRx = 16 * scale;
  const sideTabW = 52 * scale;
  const sideTabH = 32 * scale;

  return (
    <g filter={`url(#${idPrefix}-soft-glow)`}>
      <circle
        r={ringRadius}
        fill="none"
        stroke={`url(#${idPrefix}-ring-stroke)`}
        strokeWidth={10 * scale}
        strokeLinecap="round"
      />
      <rect
        x={-tabW / 2}
        y={-ringRadius - tabH + 8 * scale}
        width={tabW}
        height={tabH}
        rx={tabRx}
        fill={`url(#${idPrefix}-tab-fill)`}
      />
      <rect
        x={-tabW / 2}
        y={ringRadius - 8 * scale}
        width={tabW}
        height={tabH}
        rx={tabRx}
        fill={`url(#${idPrefix}-tab-fill)`}
      />
      <rect
        x={-ringRadius - sideTabW + 8 * scale}
        y={-sideTabH / 2}
        width={sideTabW}
        height={sideTabH}
        rx={tabRx}
        fill={`url(#${idPrefix}-tab-fill)`}
      />
      <rect
        x={ringRadius - 8 * scale}
        y={-sideTabH / 2}
        width={sideTabW}
        height={sideTabH}
        rx={tabRx}
        fill={`url(#${idPrefix}-tab-fill)`}
      />

      {withIris ? (
        <g>
          {HUNTSCOPE_IRIS_ROTATIONS.map((rotation) => (
            <path
              key={rotation}
              d={HUNTSCOPE_IRIS_BLADE_PATH}
              fill="#14082a"
              stroke="#2a1550"
              strokeWidth={1.5 * scale}
              transform={`rotate(${rotation}) scale(${scale})`}
            />
          ))}
        </g>
      ) : null}
    </g>
  );
}

function MarkDefs({ idPrefix = "hs" }: { idPrefix?: string }) {
  return (
    <defs>
      <linearGradient
        id={`${idPrefix}-ring-stroke`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#ddd6fe" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient
        id={`${idPrefix}-tab-fill`}
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#c4b5fd" />
      </linearGradient>
      <filter
        id={`${idPrefix}-soft-glow`}
        x="-40%"
        y="-40%"
        width="180%"
        height="180%"
      >
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter
        id={`${idPrefix}-grid-glow`}
        x="-80%"
        y="-80%"
        width="260%"
        height="260%"
      >
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function BackgroundDefs({ idPrefix = "hs" }: { idPrefix?: string }) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2e026d" />
        <stop offset="100%" stopColor="#15162c" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-bg-glow`} cx="50%" cy="42%" r="58%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#15162c" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const SIMPLE_GRID_SCALE = 2.8 / HUNTSCOPE_GRID.cellSize;
const SIMPLE_RETICLE_SCALE = 12.5 / 198;

/** Inline Huntscope reticle mark — matches PWA / favicon artwork. */
export function HuntscopeLogo({
  variant = "full",
  withBackground = false,
  className,
  ...props
}: HuntscopeLogoProps) {
  const idPrefix = variant === "simple" ? "hs-sm" : "hs-full";

  if (variant === "simple") {
    return (
      <svg
        viewBox="0 0 32 32"
        role="img"
        aria-label="Huntscope"
        className={cn("shrink-0", className)}
        {...props}
      >
        {withBackground ? (
          <>
            <BackgroundDefs idPrefix={`${idPrefix}-bg`} />
            <rect
              width="32"
              height="32"
              rx="7"
              fill={`url(#${idPrefix}-bg-bg)`}
            />
          </>
        ) : null}
        <MarkDefs idPrefix={idPrefix} />
        <g transform="translate(16 16)">
          <HuntscopeReticle
            scale={SIMPLE_RETICLE_SCALE}
            withIris={false}
            idPrefix={idPrefix}
          />
          <HuntscopeGrid scale={SIMPLE_GRID_SCALE} idPrefix={idPrefix} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="Huntscope"
      className={cn("shrink-0", className)}
      {...props}
    >
      {withBackground ? (
        <>
          <BackgroundDefs idPrefix={`${idPrefix}-bg`} />
          <rect
            width="512"
            height="512"
            rx="112"
            fill={`url(#${idPrefix}-bg-bg)`}
          />
          <rect
            width="512"
            height="512"
            rx="112"
            fill={`url(#${idPrefix}-bg-bg-glow)`}
          />
        </>
      ) : null}
      <MarkDefs idPrefix={idPrefix} />
      <g transform="translate(256 256)">
        <HuntscopeReticle idPrefix={idPrefix} />
        <HuntscopeGrid idPrefix={idPrefix} />
      </g>
    </svg>
  );
}
