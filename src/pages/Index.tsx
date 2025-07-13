import TideChart from '@/components/TideChart';
import { useTideData } from '@/hooks/useTideData';
import { useLocationState } from '@/hooks/useLocationState';
import LocationOnboardingStep1 from './LocationOnboardingStep1';

export default function Index() {
  const { currentLocation } = useLocationState();
  const { tideData, isLoading, error } = useTideData(currentLocation?.id);

  return currentLocation ? (
    <>
      <TideChart data={tideData} isLoading={isLoading} error={error} />
    </>
  ) : (
    <LocationOnboardingStep1 />
  );
}
