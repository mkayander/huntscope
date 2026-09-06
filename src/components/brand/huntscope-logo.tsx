import type { SVGProps } from "react";

import { cn } from "~/lib/utils";

type HuntscopeLogoProps = SVGProps<SVGSVGElement> & {
  variant?: "full" | "simple";
  withBackground?: boolean;
};

/** Inline Huntscope reticle mark — matches PWA / favicon artwork. */
export function HuntscopeLogo({
  variant = "full",
  withBackground = false,
  className,
  ...props
}: HuntscopeLogoProps) {
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
          <defs>
            <linearGradient
              id="hs-logo-bg-sm"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2e026d" />
              <stop offset="100%" stopColor="#15162c" />
            </linearGradient>
          </defs>
        ) : null}
        {withBackground ? (
          <rect width="32" height="32" rx="7" fill="url(#hs-logo-bg-sm)" />
        ) : null}
        <g transform="translate(16 16)">
          <circle r="12.5" fill="none" stroke="#c4b5fd" strokeWidth="1.6" />
          <rect
            x="-1.2"
            y="-14.8"
            width="2.4"
            height="3.2"
            rx="1.2"
            fill="#ddd6fe"
          />
          <rect
            x="-1.2"
            y="11.6"
            width="2.4"
            height="3.2"
            rx="1.2"
            fill="#ddd6fe"
          />
          <rect
            x="-14.8"
            y="-1.2"
            width="3.2"
            height="2.4"
            rx="1.2"
            fill="#ddd6fe"
          />
          <rect
            x="11.6"
            y="-1.2"
            width="3.2"
            height="2.4"
            rx="1.2"
            fill="#ddd6fe"
          />
          <g transform="translate(-4.5 -4.5)">
            <rect
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#8b5cf6"
              opacity="0.75"
            />
            <rect
              x="3.2"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#a78bfa"
              opacity="0.9"
            />
            <rect
              x="6.4"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#7c3aed"
              opacity="0.7"
            />
            <rect
              y="3.2"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#a78bfa"
              opacity="0.92"
            />
            <rect
              x="3.2"
              y="3.2"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#f5f3ff"
            />
            <rect
              x="6.4"
              y="3.2"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#a78bfa"
              opacity="0.88"
            />
            <rect
              y="6.4"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#7c3aed"
              opacity="0.65"
            />
            <rect
              x="3.2"
              y="6.4"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#8b5cf6"
              opacity="0.8"
            />
            <rect
              x="6.4"
              y="6.4"
              width="2.8"
              height="2.8"
              rx="0.8"
              fill="#8b5cf6"
              opacity="0.72"
            />
          </g>
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
        <defs>
          <linearGradient id="hs-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e026d" />
            <stop offset="100%" stopColor="#15162c" />
          </linearGradient>
          <radialGradient id="hs-logo-glow" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#15162c" stopOpacity="0" />
          </radialGradient>
        </defs>
      ) : null}
      {withBackground ? (
        <>
          <rect width="512" height="512" rx="112" fill="url(#hs-logo-bg)" />
          <rect width="512" height="512" rx="112" fill="url(#hs-logo-glow)" />
        </>
      ) : null}
      <g transform="translate(256 256)">
        <circle
          r="198"
          fill="none"
          stroke="#c4b5fd"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect x="-16" y="-228" width="32" height="52" rx="16" fill="#ddd6fe" />
        <rect x="-16" y="176" width="32" height="52" rx="16" fill="#ddd6fe" />
        <rect x="-228" y="-16" width="52" height="32" rx="16" fill="#ddd6fe" />
        <rect x="176" y="-16" width="52" height="32" rx="16" fill="#ddd6fe" />
        <g fill="#241047" stroke="#3b2667" strokeWidth="2">
          <path d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z" />
          <path
            d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z"
            transform="rotate(60)"
          />
          <path
            d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z"
            transform="rotate(120)"
          />
          <path
            d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z"
            transform="rotate(180)"
          />
          <path
            d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z"
            transform="rotate(240)"
          />
          <path
            d="M0,-150 C55,-95 95,-55 150,0 C95,55 55,95 0,150 C-55,95 -95,55 -150,0 C-95,-55 -55,-95 0,-150 Z"
            transform="rotate(300)"
          />
        </g>
        <g transform="translate(-54 -54)">
          <rect
            x="0"
            y="0"
            width="32"
            height="32"
            rx="8"
            fill="#7c3aed"
            opacity="0.72"
          />
          <rect
            x="38"
            y="0"
            width="32"
            height="32"
            rx="8"
            fill="#a78bfa"
            opacity="0.88"
          />
          <rect
            x="76"
            y="0"
            width="32"
            height="32"
            rx="8"
            fill="#6d28d9"
            opacity="0.62"
          />
          <rect
            x="0"
            y="38"
            width="32"
            height="32"
            rx="8"
            fill="#a78bfa"
            opacity="0.9"
          />
          <rect x="38" y="38" width="32" height="32" rx="8" fill="#f5f3ff" />
          <rect
            x="76"
            y="38"
            width="32"
            height="32"
            rx="8"
            fill="#a78bfa"
            opacity="0.86"
          />
          <rect
            x="0"
            y="76"
            width="32"
            height="32"
            rx="8"
            fill="#6d28d9"
            opacity="0.58"
          />
          <rect
            x="38"
            y="76"
            width="32"
            height="32"
            rx="8"
            fill="#8b5cf6"
            opacity="0.78"
          />
          <rect
            x="76"
            y="76"
            width="32"
            height="32"
            rx="8"
            fill="#7c3aed"
            opacity="0.68"
          />
        </g>
      </g>
    </svg>
  );
}
