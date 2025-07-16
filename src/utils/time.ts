export function formatSignedDuration(mins: number) {
  const sign = mins === 0 ? '' : mins > 0 ? '+' : '–';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}h ${m}m`;
}

export function getSolsticeDate(type: 'summer' | 'winter', year: number) {
  return new Date(`${year}-${type === 'summer' ? '06-21' : '12-21'}T12:00:00`);
}
