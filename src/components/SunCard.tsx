import React from 'react';
import { calculateSolarTimes } from '@/utils/solarUtils';
import { lookupZipCode } from '@/utils/zipCodeLookup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatSignedDuration } from '../utils/time';

interface SunCardProps {
  lat: number;
  lng: number;
  date: Date;
}

const SunCard: React.FC<SunCardProps> = ({ lat, lng, date }) => {
  const [zip, setZip] = React.useState('');
  const [coords, setCoords] = React.useState({ lat, lng });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sunTimes = React.useMemo(() => calculateSolarTimes(date, coords.lat, coords.lng), [date, coords]);
  const todayDaylightMins = sunTimes.daylightMinutes;

  const year = date.getFullYear();
  const summerSolstice = new Date(`${year}-06-21T12:00:00`);
  const winterSolstice =
    date < summerSolstice
      ? new Date(`${year - 1}-12-21T12:00:00`)
      : new Date(`${year}-12-21T12:00:00`);

  const isSummerWindow = date >= summerSolstice && date < winterSolstice;
  const refLabelDate = isSummerWindow ? 'Jun 21' : 'Dec 21';
  const refSeasonFull = isSummerWindow ? 'Summer' : 'Winter';

  const solsticeDaylightMins = calculateSolarTimes(
    isSummerWindow ? summerSolstice : winterSolstice,
    coords.lat,
    coords.lng
  ).daylightMinutes;
  const deltaMins = todayDaylightMins - solsticeDaylightMins;

  const gettingLonger = sunTimes.changeFromPrevious?.includes('+');
  const gettingShorter = sunTimes.changeFromPrevious?.includes('-');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zip.trim() || loading) return;
    if (!/^\d{5}$/.test(zip.trim())) {
      setError('Enter valid ZIP');
      return;
    }
    setLoading(true);
    const res = await lookupZipCode(zip.trim());
    setLoading(false);
    if (res && res.places && res.places.length > 0) {
      setCoords({
        lat: parseFloat(res.places[0].latitude),
        lng: parseFloat(res.places[0].longitude),
      });
      setError(null);
    } else {
      setError('ZIP not found');
    }
  };

  return (
    <div className="flex flex-col gap-y-2 text-sm">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="ZIP"
          className="h-7 px-2 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={loading || !/^\d{5}$/.test(zip.trim())}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set'}
        </Button>
      </form>
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="flex flex-col gap-y-0.5">
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
        <div className="flex items-center whitespace-nowrap gap-1 text-[0.688rem] sm:text-xs md:text-sm text-gray-400">
          Since {refLabelDate} ({refSeasonFull} Solstice)
        </div>
        <div className={deltaMins < 0 ? 'text-red-400' : 'text-lime-400'}>
          Daylight {formatSignedDuration(deltaMins)}
        </div>
      </div>
    </div>
  </div>
  );
};

export default SunCard;
