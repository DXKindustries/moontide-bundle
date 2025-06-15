
// Solar calculation utilities

export type SolarTimes = {
  sunrise: string;
  sunset: string;
  daylight: string;
  daylightMinutes: number; // Total daylight in minutes for comparison
  changeFromPrevious?: string; // Change from previous day
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
  
  // Format times in 12-hour AM/PM format
  const formatTime = (hour: number): string => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };
  
  const sunrise = formatTime(sunriseHour);
  const sunset = formatTime(sunsetHour);
  
  // Calculate daylight duration for current day
  const daylightHours = sunsetHour - sunriseHour;
  const hours = Math.floor(daylightHours);
  const minutes = Math.floor((daylightHours - hours) * 60);
  const daylight = `${hours}h ${minutes}m`;
  const daylightMinutes = Math.floor(daylightHours * 60);
  
  // Calculate daylight duration for previous day using the same method
  const previousDay = new Date(date);
  previousDay.setDate(previousDay.getDate() - 1);
  const previousDayOfYear = Math.floor((previousDay.getTime() - new Date(previousDay.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  const previousSolarDeclination = 23.45 * Math.sin((360 * (284 + previousDayOfYear) / 365) * Math.PI / 180);
  const previousHourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(previousSolarDeclination * Math.PI / 180));
  
  const previousSunriseHour = 12 - (previousHourAngle * 180 / Math.PI) / 15;
  const previousSunsetHour = 12 + (previousHourAngle * 180 / Math.PI) / 15;
  const previousDaylightHours = previousSunsetHour - previousSunriseHour;
  const previousDaylightMinutes = Math.floor(previousDaylightHours * 60);
  
  // Calculate the difference in minutes
  const changeInMinutes = daylightMinutes - previousDaylightMinutes;
  let changeFromPrevious = "";
  
  if (Math.abs(changeInMinutes) < 1) {
    changeFromPrevious = "same as yesterday";
  } else if (changeInMinutes > 0) {
    if (changeInMinutes >= 60) {
      const changeHours = Math.floor(changeInMinutes / 60);
      const changeMin = changeInMinutes % 60;
      changeFromPrevious = `+${changeHours}h ${changeMin}m longer`;
    } else {
      changeFromPrevious = `+${changeInMinutes}m longer`;
    }
  } else {
    const absChange = Math.abs(changeInMinutes);
    if (absChange >= 60) {
      const changeHours = Math.floor(absChange / 60);
      const changeMin = absChange % 60;
      changeFromPrevious = `-${changeHours}h ${changeMin}m shorter`;
    } else {
      changeFromPrevious = `-${absChange}m shorter`;
    }
  }
  
  return { sunrise, sunset, daylight, daylightMinutes, changeFromPrevious };
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
