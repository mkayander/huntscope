"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { STATUS_ORDER } from "~/lib/career-ops/status-meta";

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
  const statusOrderSet = new Set<string>(STATUS_ORDER);
  const uniqueOptions = [
    ...STATUS_ORDER.filter((status) => options.includes(status)),
    ...options.filter((status) => !statusOrderSet.has(status)),
  ];

  if (!uniqueOptions.includes(value) && value.trim().length > 0) {
    uniqueOptions.unshift(value);
  }

  return (
    <Select value={value} disabled={disabled} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-full border-white/15 bg-[#15162c] text-xs text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-white/15 bg-[#15162c] text-white">
        {uniqueOptions.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
