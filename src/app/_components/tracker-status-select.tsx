"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { clickableRowClassName } from "~/components/ui/interaction";
import { STATUS_ORDER } from "~/lib/career-ops/status-meta";
import { cn } from "~/lib/utils";

type TrackerStatusSelectProps = {
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (status: string) => void;
};

export function TrackerStatusSelect({
  value,
  options,
  disabled = false,
  onChange,
}: TrackerStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const statusOrderSet = new Set<string>(STATUS_ORDER);
  const uniqueOptions = [
    ...STATUS_ORDER.filter((status) => options.includes(status)),
    ...options.filter((status) => !statusOrderSet.has(status)),
  ];

  if (!uniqueOptions.includes(value) && value.trim().length > 0) {
    uniqueOptions.unshift(value);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="brandSecondary"
          disabled={disabled}
          className="h-8 w-full justify-between border-white/15 bg-[#15162c] px-2.5 text-xs font-normal text-white hover:bg-[#1a1b35]"
        >
          <span className="truncate">{value || "Select status"}</span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-white/50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] border-white/15 bg-[#15162c] p-1 text-white"
      >
        <ul className="max-h-64 space-y-0.5 overflow-y-auto">
          {uniqueOptions.map((status) => {
            const isSelected = status === value;

            return (
              <li key={status}>
                <button
                  type="button"
                  className={cn(
                    clickableRowClassName,
                    "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-white/10",
                    isSelected && "bg-white/5 text-white",
                  )}
                  onClick={() => {
                    onChange(status);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{status}</span>
                  {isSelected ? (
                    <CheckIcon className="size-3.5 shrink-0 text-violet-300" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
