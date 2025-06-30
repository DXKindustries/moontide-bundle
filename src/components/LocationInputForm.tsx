
import React, { useState, useRef, useEffect } from 'react';
import { Search, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationInputFormProps {
  placeholder?: string;
  autoFocus?: boolean;
  isLoading: boolean;
  onSearch: (input: string) => void;
  onGPSRequest: () => void;
}

export default function LocationInputForm({
  placeholder = "ZIP, City State, or NOAA Station Name/ID",
  autoFocus = true,
  isLoading,
  onSearch,
  onGPSRequest
}: LocationInputFormProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        onSearch(input.trim());
      }
    }
  };

  const handleClear = () => {
    setInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSearchClick = () => {
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Enter Location</h3>
        <p className="text-sm text-muted-foreground">
          ZIP, City State, or City State ZIP
        </p>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pr-8"
            disabled={isLoading}
          />
          {input && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button 
          onClick={handleSearchClick}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <div className="animate-spin">⏳</div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button 
        variant="outline" 
        onClick={onGPSRequest}
        disabled={isLoading}
        className="w-full"
      >
        <Navigation className="h-4 w-4 mr-2" />
        Use Current Location (GPS)
      </Button>

      {/* Input Format Help */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Supported formats:</strong></p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>ZIP: <code>02840</code></li>
          <li>City State: <code>Newport RI</code></li>
          <li>Full: <code>Newport RI 02840</code></li>
          <li>Station name: <code>Green Cove Springs</code></li>
          <li>Station ID: <code>8452660</code></li>
        </ul>
      </div>
    </div>
  );
}
