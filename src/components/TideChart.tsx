import EmptyState from './EmptyState';
import type { TideDatum } from '@/hooks/useTideData';
import { safeArray } from '@/utils/safeArray';

interface Props {
  tideData: TideDatum[];          // always an array
  isLoading: boolean;
  error: null | 'no-station' | 'fetch-fail';
}
export default function TideChart({ tideData, isLoading, error }: Props) {
  const data = safeArray(tideData);
  if (!data.length) {
    return (
      <EmptyState
        text={
          error === 'no-station'
            ? 'Pick a location to see tides'
            : error === 'fetch-fail'
              ? 'Last fetch failed – retrying…'
              : isLoading
                ? 'Loading…'
                : 'No data cached'
        }
      />
    );
  }
  return (
    <div>
      {/* TODO: render chart with data */}
    </div>
  );
}
