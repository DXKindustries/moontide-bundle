import React, { useState } from 'react';
import StarsBackdrop from '@/components/StarsBackdrop';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const states = [
  { value: 'CA', label: 'California' },
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
];

const citiesByState: Record<string, string[]> = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
  NY: ['New York City', 'Buffalo', 'Rochester'],
  TX: ['Houston', 'Austin', 'Dallas', 'San Antonio'],
};

const LocationOnboardingStep1 = () => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity('');
  };

  const cityOptions = selectedState ? citiesByState[selectedState] || [] : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      <StarsBackdrop />
      <div className="space-y-4 w-full max-w-sm relative z-10">
        <h1 className="text-center text-xl font-bold">Select Your Location</h1>

        <Select onValueChange={handleStateChange} value={selectedState}>
          <SelectTrigger>
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((st) => (
              <SelectItem key={st.value} value={st.value}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedState && (
          <Select onValueChange={setSelectedCity} value={selectedCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button disabled={!selectedState || !selectedCity}>Next</Button>
      </div>
    </div>
  );
};

export default LocationOnboardingStep1;
