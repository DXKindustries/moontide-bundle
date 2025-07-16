
// Helper: Haversine distance calculation
export const haversineDistance = (
  lat1: number, lon1: number, lat2: number, lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Function to determine moon phase based on date
// DEPRECATED: use calculateMoonPhase from src/utils/lunarUtils.ts instead
export const getMoonPhase = (date: Date): { phase: string, illumination: number } => {
  // Simple moon phase calculation (approximate)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Calculate approximate phase of moon
  // This is a simplified calculation and not perfectly accurate
  const c = Math.floor((year - 1900) / 100);
  const y = year - 1900 - c;
  const m = month;
  const d = day;
  
  // Approximate full moon date calculation
  const j = 2.515 * Math.sin(0.0172 * (0.5 + m + (y + c / 4) * 12) * Math.PI);
  const phase = (d + j) % 29.53;
  
  // Convert phase to percentage (0 to 100)
  const percentPhase = Math.round((phase / 29.53) * 100);
  
  // Map percentage to phase name
  const illumination = Math.abs(50 - percentPhase) * 2; // 0-100%
  
  let phaseName;
  if (percentPhase < 3.69) phaseName = "New Moon";
  else if (percentPhase < 18.42) phaseName = "Waxing Crescent";
  else if (percentPhase < 25.53) phaseName = "First Quarter";
  else if (percentPhase < 46.58) phaseName = "Waxing Gibbous";
  else if (percentPhase < 50.27) phaseName = "Full Moon";
  else if (percentPhase < 71.32) phaseName = "Waning Gibbous";
  else if (percentPhase < 78.43) phaseName = "Last Quarter";
  else if (percentPhase < 96.32) phaseName = "Waning Crescent";
  else phaseName = "New Moon";
  
  return {
    phase: phaseName,
    illumination: Math.round(illumination)
  };
};
