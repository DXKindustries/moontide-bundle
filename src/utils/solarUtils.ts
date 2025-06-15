
// Solar calculation utilities

export type SolarTimes = {
  sunrise: string;
  sunset: string;
  daylight: string;
};

export type SolarEvent = {
  name: string;
  emoji: string;
  description: string;
};

// Calculate sunrise and sunset times (simplified approximation)
export const calculateSolarTimes = (date: Date, lat: number = 41.4353, lng: number = -71.4616): SolarTimes => {
  // This is a simplified calculation - in a real app you'd use a proper solar calculation library
  // Using approximate times for the given coordinates (Narragansett, RI area)
  
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Approximate sunrise/sunset calculation based on day of year and latitude
  const solarDeclination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(solarDeclination * Math.PI / 180));
  
  // Convert to hours
  const sunriseHour = 12 - (hourAngle * 180 / Math.PI) / 15;
  const sunsetHour = 12 + (hourAngle * 180 / Math.PI) / 15;
  
  // Format times
  const formatTime = (hour: number): string => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  const sunrise = formatTime(sunriseHour);
  const sunset = formatTime(sunsetHour);
  
  // Calculate daylight duration
  const daylightHours = sunsetHour - sunriseHour;
  const hours = Math.floor(daylightHours);
  const minutes = Math.floor((daylightHours - hours) * 60);
  const daylight = `${hours}h ${minutes}m`;
  
  return { sunrise, sunset, daylight };
};

// Solar events (solstices and equinoxes)
export const getSolarEvents = (date: Date): SolarEvent | null => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Approximate dates for solar events
  if (month === 3 && day >= 19 && day <= 21) {
    return { name: "Spring Equinox", emoji: "☀️", description: "First day of spring" };
  }
  if (month === 6 && day >= 20 && day <= 22) {
    return { name: "Summer Solstice", emoji: "☀️", description: "Longest day of the year" };
  }
  if (month === 9 && day >= 21 && day <= 23) {
    return { name: "Autumn Equinox", emoji: "☀️", description: "First day of autumn" };
  }
  if (month === 12 && day >= 20 && day <= 22) {
    return { name: "Winter Solstice", emoji: "☀️", description: "Shortest day of the year" };
  }
  
  return null;
};
