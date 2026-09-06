import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-0 text-center text-sm font-medium whitespace-nowrap shadow-none transition-[color,background-color,box-shadow,transform,filter] duration-200 outline-none select-none cursor-pointer focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-0 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none aria-invalid:ring-[3px] aria-invalid:ring-destructive/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md shadow-black/20 hover:bg-[color-mix(in_oklch,var(--primary),white_8%)] hover:shadow-lg hover:shadow-violet-950/25 active:bg-[color-mix(in_oklch,var(--primary),black_6%)]",
        outline:
          "bg-background/40 text-foreground shadow-sm backdrop-blur-sm ring-1 ring-inset ring-white/10 hover:bg-muted/80 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/25 dark:hover:bg-input/45",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-[color-mix(in_oklch,var(--secondary),white_8%)] hover:shadow-md aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-foreground hover:bg-muted/70 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/45",
        destructive:
          "bg-destructive/12 text-destructive shadow-sm hover:bg-destructive/20 focus-visible:ring-destructive/25 dark:bg-destructive/18 dark:hover:bg-destructive/28",
        link: "h-auto p-0 text-primary underline-offset-4 shadow-none hover:underline active:scale-100",
        brand:
          "rounded-full bg-gradient-to-b from-violet-400 to-violet-600 font-semibold leading-none text-white shadow-lg shadow-violet-950/40 hover:from-violet-300 hover:to-violet-500 hover:shadow-violet-900/50 active:from-violet-500 active:to-violet-700 focus-visible:ring-violet-300/50",
        brandSecondary:
          "rounded-full bg-white/10 font-medium leading-none text-white ring-1 ring-inset ring-white/10 hover:bg-white/16 active:bg-white/22 focus-visible:ring-white/35",
        chip: "h-auto rounded-full bg-transparent px-3 py-1 text-xs font-medium leading-none hover:brightness-110 active:scale-[0.98]",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 leading-none has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 text-xs leading-none in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),12px)] px-3 text-[0.8rem] leading-none in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 px-5 text-[0.925rem] leading-none has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        cta: "min-h-12 rounded-full px-10 py-3 text-base leading-tight",
        pill: "min-h-9 rounded-full px-4 py-2 leading-tight",
        pillSm: "min-h-8 rounded-full px-3.5 py-1.5 text-xs leading-tight",
        icon: "size-9",
        "icon-xs":
          "size-7 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
