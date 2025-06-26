
// Helper functions for date and time formatting

export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getCurrentIsoDateString = (): string => {
  return new Date().toISOString().split('T')[0];
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
