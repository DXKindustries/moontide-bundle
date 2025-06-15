
// Helper functions for date and time formatting

export const getCurrentDateString = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
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
