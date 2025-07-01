
// Helper functions for date and time formatting

export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const pad = (n: number) => n.toString().padStart(2, '0');

export const formatDateAsLocalIso = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const getCurrentIsoDateString = (): string => {
  return formatDateAsLocalIso(new Date());
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatApiDate = (apiDate: string): string => {
  // apiDate is YYYY-MM-DD. new Date(apiDate) will interpret it as YYYY-MM-DD 00:00:00 UTC.
  // This causes off-by-one day errors in timezones behind UTC.
  // Appending T00:00:00 makes it be parsed as local time.
  const date = new Date(`${apiDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatTimeToAmPm = (timeString: string): string => {
  // Handle time strings in format "HH:MM" or "H:MM"
  const [hours, minutes] = timeString.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return timeString; // Return original if parsing fails
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Format an ISO date-time string ("YYYY-MM-DDTHH:MM:SS") to 12-hour time
// without applying any timezone conversion. NOAA predictions are returned
// in the station's local time without a timezone offset, so treating them
// as UTC results in shifted times. This helper simply parses the hour and
// minute portion and formats it directly.
export const formatIsoToAmPm = (isoString: string): string => {
  const timePart = isoString.split('T')[1];
  if (!timePart) return isoString;
  const [hourStr, minuteStr] = timePart.split(':');
  const hours = Number(hourStr);
  const minutes = Number(minuteStr);
  if (isNaN(hours) || isNaN(minutes)) return isoString;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minuteStr.padStart(2, '0')} ${period}`;
};

// Parse an ISO string like "YYYY-MM-DDTHH:MM:SS" as if it were in the local
// timezone rather than UTC. This keeps the hour/minute values intact so tide
// times from NOAA display correctly.
export const parseIsoAsLocal = (isoString: string): Date => {
  const [datePart, timePart] = isoString.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h = 0, mi = 0, s = 0] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, h, mi, s);
};
