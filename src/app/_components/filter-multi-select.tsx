"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export type FilterMultiSelectOption<T extends string> = {
  value: T;
  label: string;
};

type FilterMultiSelectProps<T extends string> = {
  id: string;
  label: string;
  options: FilterMultiSelectOption<T>[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder: string;
};

function summarizeSelection<T extends string>(
  selected: T[],
  options: FilterMultiSelectOption<T>[],
  placeholder: string,
): string {
  if (selected.length === 0) {
    return placeholder;
  }

  if (selected.length === 1) {
    return (
      options.find((option) => option.value === selected[0])?.label ??
      "1 selected"
    );
  }

  return `${selected.length} selected`;
}

export function FilterMultiSelect<T extends string>({
  id,
  label,
  options,
  selected,
  onChange,
  placeholder,
}: FilterMultiSelectProps<T>) {
  const summary = summarizeSelection(selected, options, placeholder);

  const toggleValue = (value: T) => {
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-white/80">
        {label}
      </Label>
      <Popover modal={false}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="brandSecondary"
            size="default"
            className={cn(
              "h-8 w-full justify-between border-white/15 bg-[#15162c] px-2.5 font-normal text-white hover:bg-[#15162c]/90",
              selected.length === 0 && "text-white/50",
            )}
          >
            <span className="truncate">{summary}</span>
            <ChevronDownIcon className="size-4 shrink-0 text-white/50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-1.5"
        >
          <ul className="max-h-64 space-y-0.5 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option.value);

              return (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/8">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(option.value)}
                      className="size-3.5 rounded border-white/25 bg-transparent accent-violet-500"
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
