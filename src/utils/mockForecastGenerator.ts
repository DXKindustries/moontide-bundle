
import { TideForecast } from '@/services/noaaService';
import { calculateMoonPhase } from '@/utils/lunarUtils';

// Generate mock weekly forecast data for demo purposes
export const generateMockWeeklyForecast = (): TideForecast[] => {
  const forecast: TideForecast[] = [];
  const today = new Date();
  
  console.log(`🗓️ Generating mock forecast starting from: ${today.toISOString().slice(0, 10)}`);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Calculate actual moon phase for each specific day
    const moonData = calculateMoonPhase(date);
    
    console.log(`📅 Day ${i}: ${dateStr} (${day}) - Phase: ${moonData.phase}, Illumination: ${moonData.illumination}%`);
    
    // Generate realistic tide times and heights with proper progression
    const baseHighTime1 = 6 + (i * 0.8); // Gradually shifting tide times
    const baseHighTime2 = 18 + (i * 0.8);
    const baseLowTime1 = 12 + (i * 0.8);
    const baseLowTime2 = 0 + (i * 0.8);
    
    const formatTime = (hour: number) => {
      const h = Math.floor(hour) % 24;
      const m = Math.floor((hour % 1) * 60);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    
    forecast.push({
      date: dateStr,
      day,
      moonPhase: moonData.phase, // Use calculated moon phase for this specific date
      illumination: moonData.illumination, // Use calculated illumination for this specific date
      highTide: {
        time: formatTime(baseHighTime1),
        height: 3.2 + Math.sin(i * 0.5) * 0.8 // Varying heights between 2.4-4.0m
      },
      lowTide: {
        time: formatTime(baseLowTime1),
        height: 0.6 + Math.sin(i * 0.3) * 0.4 // Varying heights between 0.2-1.0m
      }
    });
  }
  
  console.log('📅 Final generated mock weekly forecast with calculated moon phases:', forecast.map(f => ({
    date: f.date,
    day: f.day,
    moonPhase: f.moonPhase,
    illumination: f.illumination
  })));
  
  return forecast;
};
