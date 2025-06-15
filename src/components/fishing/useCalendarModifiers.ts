
import { calculateMoonPhase } from "@/utils/lunarUtils";
import { getSolarEvents } from "@/utils/solarUtils";

/**
 * Custom hook to provide calendar day modifiers and classes for moon and solar events.
 */
export function useCalendarModifiers() {
  const modifiers = {
    fullMoon: (date: Date) => {
      const { phase } = calculateMoonPhase(date);
      const isFullMoon = phase === "Full Moon";
      if (isFullMoon) {
        console.log(`✨ FULL MOON detected for ${date.toDateString()}`);
      }
      return isFullMoon;
    },
    newMoon: (date: Date) => {
      const { phase } = calculateMoonPhase(date);
      const isNewMoon = phase === "New Moon";
      if (isNewMoon) {
        console.log(`🌑 NEW MOON detected for ${date.toDateString()}`);
      }
      return isNewMoon;
    },
    solarEvent: (date: Date) => {
      const solarEvent = getSolarEvents(date);
      const hasSolarEvent = solarEvent !== null;
      if (hasSolarEvent) {
        console.log(`☀️ SOLAR EVENT detected for ${date.toDateString()}: ${solarEvent.name}`);
      }
      return hasSolarEvent;
    }
  };

  const modifiersClassNames = {
    fullMoon: "calendar-full-moon",
    newMoon: "calendar-new-moon",
    solarEvent: "calendar-solar-event"
  };

  return { modifiers, modifiersClassNames };
}

