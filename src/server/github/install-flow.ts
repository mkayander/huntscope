/** Whether the install entry route should attempt a background sync first. */
export function shouldAttemptInstallationSync(
  existingConnection: unknown,
): boolean {
  return existingConnection == null;
}
