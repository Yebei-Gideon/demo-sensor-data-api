/**
 * Safely formats a given timestamp or date string into a localized format.
 */
export const safeFormatDate = (tick: any, style: 'axis' | 'tooltip' = 'axis') => {
  if (tick === undefined || tick === null) return "—";

  let parsedTick = tick;
  if (typeof tick === "string") {
    parsedTick = parseFloat(tick);
  }

  const date = typeof parsedTick === "number" && parsedTick < 10000000000
    ? new Date(parsedTick * 1000)
    : new Date(parsedTick);

  if (isNaN(date.getTime())) return "—";

  if (style === 'axis') {
    return new Intl.DateTimeFormat(navigator.language, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  return new Intl.DateTimeFormat(navigator.language, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};
