export function longestLabel(labels: readonly string[]): string {
  return labels.reduce(
    (longest, label) => (label.length > longest.length ? label : longest),
    "",
  );
}
