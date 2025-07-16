import React from 'react';
import { calculateSolarTimes } from '@/utils/solarUtils';
import { formatSignedDuration } from '../utils/time';

interface SunCardProps {
  lat: number;
  lng: number;
  date: Date;
}

const SunCard: React.FC<SunCardProps> = ({ lat, lng, date }) => {
  const sunTimes = React.useMemo(() => calculateSolarTimes(date, lat, lng), [date, lat, lng]);
  const todayDaylightMins = sunTimes.daylightMinutes;

  const year = date.getFullYear();
  const summerSolstice = new Date(`${year}-06-21T12:00:00`);
  const winterSolstice =
    date < summerSolstice
      ? new Date(`${year - 1}-12-21T12:00:00`)
      : new Date(`${year}-12-21T12:00:00`);

  const isSummerWindow = date >= summerSolstice && date < winterSolstice;
  const refLabelDate = isSummerWindow ? 'Jun 21' : 'Dec 21';
  const refSeason = isSummerWindow ? 'Summer' : 'Winter';

  const solsticeDaylightMins = calculateSolarTimes(
    isSummerWindow ? summerSolstice : winterSolstice,
    lat,
    lng
  ).daylightMinutes;
  const deltaMins = todayDaylightMins - solsticeDaylightMins;

  const gettingLonger = sunTimes.changeFromPrevious?.includes('+');
  const gettingShorter = sunTimes.changeFromPrevious?.includes('-');

  return (
    <div className="flex flex-col gap-y-0.5 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Sunrise</span>
        <span className="font-semibold">{sunTimes.sunrise}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Sunset</span>
        <span className="font-semibold">{sunTimes.sunset}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Daylight</span>
        <span className="font-semibold text-yellow-400">{sunTimes.daylight}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Darkness</span>
        <span className="font-semibold text-blue-400">{sunTimes.darkness}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Change</span>
        <span className={`font-semibold ${gettingLonger ? 'text-lime-400' : gettingShorter ? 'text-red-400' : 'text-gray-300'}`}>{sunTimes.changeFromPrevious}</span>
      </div>
      <div className="mt-1 text-sm leading-tight">
        <div className="text-gray-400">
          Since {refLabelDate} ({refSeason} Solstice)
        </div>
        <div className={deltaMins < 0 ? 'text-red-400' : 'text-lime-400'}>
          Daylight {formatSignedDuration(deltaMins)}
        </div>
      </div>
    </div>
  );
};

export default SunCard;
