
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';

interface ZipCodeInputProps {
  onZipSubmit: (zipCode: string) => Promise<void>;
  onClear?: () => void; // New prop to handle clearing
  isLoading: boolean;
  error: string | null;
}

export default function ZipCodeInput({ onZipSubmit, onClear, isLoading, error }: ZipCodeInputProps) {
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
    
    // If the user clears the input completely, notify parent
    if (value === '' && onClear) {
      onClear();
    }
  };

  const handleClear = () => {
    setZipCode('');
    if (onClear) {
      onClear();
    }
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
        <div className="relative flex-1">
          <Input
            type="text"
            value={zipCode}
            onChange={handleInputChange}
            placeholder="12345"
            maxLength={5}
            className="text-center text-lg font-mono pr-8"
            disabled={isLoading}
          />
          {zipCode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
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
