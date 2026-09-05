const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseApplicationDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (DATE_KEY_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const slashMatch = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(trimmed);
  if (slashMatch) {
    return `${slashMatch[1]}-${pad2(Number(slashMatch[2]))}-${pad2(Number(slashMatch[3]))}`;
  }

  const dottedMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(trimmed);
  if (dottedMatch) {
    return `${dottedMatch[3]}-${pad2(Number(dottedMatch[2]))}-${pad2(Number(dottedMatch[1]))}`;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return toDateKey(new Date(parsed));
}

export function dateKeyToDate(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
