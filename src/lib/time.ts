/**
 * Converts minutes to seconds.
 * The system stores time-based durations in seconds.
 */
export function minutesToSeconds(minutes: number): number {
  return Math.round(minutes * 60);
}

/**
 * Converts seconds to minutes.
 * The UI displays time-based durations in minutes.
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Formats a duration in seconds into a "MM:SS" or "SSs" string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
