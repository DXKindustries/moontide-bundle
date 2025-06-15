
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

interface ZipCodeInputProps {
  onZipSubmit: (zipCode: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function ZipCodeInput({ onZipSubmit, isLoading, error }: ZipCodeInputProps) {
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim() && !isLoading) {
      await onZipSubmit(zipCode.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Your ZIP Code</h3>
        <p className="text-sm text-muted-foreground">
          We'll automatically find your city and coordinates
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={zipCode}
          onChange={handleInputChange}
          placeholder="12345"
          maxLength={5}
          className="text-center text-lg font-mono"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={zipCode.length !== 5 || isLoading}
          size="default"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {error && (
        <div className="text-sm text-red-600 text-center p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
