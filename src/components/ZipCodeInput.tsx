
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';

interface ZipCodeInputProps {
  onZipSubmit: (input: string) => Promise<void>; // Changed from zipCode to input
  onClear?: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function ZipCodeInput({ onZipSubmit, onClear, isLoading, error }: ZipCodeInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await onZipSubmit(input.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // If the user clears the input completely, notify parent
    if (value === '' && onClear) {
      onClear();
    }
  };

  const handleClear = () => {
    setInput('');
    if (onClear) {
      onClear();
    }
  };

  // Helper to validate input format
  const isValidInput = (input: string): boolean => {
    const trimmed = input.trim();
    
    // ZIP code only (5 digits)
    if (/^\d{5}$/.test(trimmed)) return true;
    
    // City, State ZIP (e.g., "Newport, RI 02840")
    if (/^.+,\s*[A-Za-z]{2}\s+\d{5}$/.test(trimmed)) return true;
    
    // City, State (e.g., "Newport, RI")
    if (/^.+,\s*[A-Za-z]{2}$/.test(trimmed)) return true;
    
    return false;
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Your Location</h3>
        <p className="text-sm text-muted-foreground">
          ZIP, City/State, or "City, ST ZIP"
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="02840 or Newport, RI"
            className="text-center pr-8"
            disabled={isLoading}
          />
          {input && (
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
          disabled={!input.trim() || !isValidInput(input) || isLoading}
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

      {/* Input Format Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>ZIP: <code>02840</code></li>
          <li>City, State: <code>Newport, RI</code></li>
          <li>Full: <code>Newport, RI 02840</code></li>
          <li>Station name: <code>Green Cove Springs</code></li>
          <li>Station ID: <code>8452660</code></li>
        </ul>
      </div>
    </div>
  );
}
