import EmptyState from './EmptyState';
import type { TideDatum } from '@/hooks/useTideData';
import LoadingSpinner from './LoadingSpinner';
import { safeArray } from '@/utils/safeArray';

interface Props {
  data?: TideDatum[];
  isLoading: boolean;
  error: null | 'no-station' | 'fetch-fail';
}
export default function TideChart({ data, isLoading, error }: Props) {
  const rows = safeArray(data);

  if (!rows.length) {
    if (isLoading) return <LoadingSpinner />;
    return (
      <EmptyState
        text={
          error === 'fetch-fail'
            ? 'Last update failed – retrying…'
            : 'Pick a location to see tides'
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
