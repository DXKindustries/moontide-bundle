import React from 'react';
import { calculateSolarTimes } from '@/utils/solarUtils';
import { formatSignedDuration, getSolsticeDate } from '@/utils/time';

interface SunCardProps {
  lat: number;
  lng: number;
  date: Date;
}

const SunCard: React.FC<SunCardProps> = ({ lat, lng, date }) => {
  const sunTimes = React.useMemo(() => calculateSolarTimes(date, lat, lng), [date, lat, lng]);
  const todayDaylightMins = sunTimes.daylightMinutes;

  const year = date.getFullYear();
  const solsticeSummer = getSolsticeDate('summer', year);
  const solsticeWinter = getSolsticeDate('winter', year);
  const daylightSummerMins = calculateSolarTimes(solsticeSummer, lat, lng).daylightMinutes;
  const daylightWinterMins = calculateSolarTimes(solsticeWinter, lat, lng).daylightMinutes;
  const deltaFromSummer = todayDaylightMins - daylightSummerMins;
  const deltaFromWinter = todayDaylightMins - daylightWinterMins;

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
      <div className="flex justify-between text-sm mt-1">
        <span className="text-gray-400">Summer&nbsp;Solstice&nbsp;(Jun&nbsp;21)</span>
        <span className={deltaFromSummer < 0 ? 'text-red-400' : 'text-lime-400'}>
          🕒 {formatSignedDuration(deltaFromSummer)}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Winter&nbsp;Solstice&nbsp;(Dec&nbsp;21)</span>
        <span className={deltaFromWinter > 0 ? 'text-lime-400' : 'text-red-400'}>
          🕒 {formatSignedDuration(deltaFromWinter)}
        </span>
      </div>
    </div>
  );
};

export default SunCard;
