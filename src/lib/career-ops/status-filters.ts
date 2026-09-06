export function arraysEqual<T>(left: T[], right: T[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function toggleStatusFilter(
  filters: string[],
  status: string,
): string[] {
  return filters.includes(status)
    ? filters.filter((entry) => entry !== status)
    : [...filters, status];
}

export function isStatusHighlighted(
  filters: string[],
  status: string,
): boolean {
  return filters.length === 0 || filters.includes(status);
}
