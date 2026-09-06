import { HuntscopeLogo } from "~/components/brand/huntscope-logo";
import { cn } from "~/lib/utils";

type HuntscopeWordmarkProps = {
  className?: string;
  logoClassName?: string;
  titleClassName?: string;
};

export function HuntscopeWordmark({
  className,
  logoClassName,
  titleClassName,
}: HuntscopeWordmarkProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <HuntscopeLogo
        variant="simple"
        withBackground
        className={cn(
          "size-12 shadow-lg shadow-violet-950/40 sm:size-14",
          logoClassName,
        )}
      />
      <h1
        className={cn(
          "text-5xl font-extrabold tracking-tight sm:text-[5rem]",
          titleClassName,
        )}
      >
        Hunt<span className="text-[hsl(280,100%,70%)]">scope</span>
      </h1>
    </div>
  );
}
