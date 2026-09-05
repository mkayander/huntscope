"use client";

import { useLocale } from "~/lib/i18n/locale-context";
import { formatApplicationDate } from "~/lib/i18n/date-format";

type ApplicationDateProps = {
  value: string;
  className?: string;
  title?: string;
};

export function ApplicationDate({ value, className, title }: ApplicationDateProps) {
  const locale = useLocale();
  const formatted = formatApplicationDate(value, locale);

  return (
    <span className={className} title={title ?? value}>
      {formatted}
    </span>
  );
}
