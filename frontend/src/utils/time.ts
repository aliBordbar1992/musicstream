/**
 * Formats a duration in seconds to a MM:SS string format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "3:45") or "--:--" if no duration
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
