import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MapPin, Search, ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { safeLocalStorage } from '@/utils/localStorage';
import { lookupZipCode, formatCityStateFromZip, addCustomZipEntry } from '@/utils/zipCodeLookup';

type Location = {
  id: string;
  name: string;
  country: string;
  zipCode?: string;
}

type LocationSelectorProps = {
  onLocationChange: (location: Location) => void;
  currentLocation: Location;
}

// Default locations to show when no saved locations exist
const defaultLocations: Location[] = [
  {
    id: "sf",
    name: "San Francisco",
    country: "USA",
    zipCode: "94105"
  },
  {
    id: "ny",
    name: "New York",
    country: "USA",
    zipCode: "10007"
  },
  {
    id: "miami",
    name: "Miami",
    country: "USA",
    zipCode: "33131"
  },
  {
    id: "seattle",
    name: "Seattle",
    country: "USA",
    zipCode: "98101"
  }
];

const LocationSelector = ({ onLocationChange, currentLocation }: LocationSelectorProps) => {
  // Show location form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form states
  const [locationName, setLocationName] = useState("");
  const [locationCountry, setLocationCountry] = useState("USA");
  const [locationZipCode, setLocationZipCode] = useState("");
  
  // ZIP lookup states
  const [isZipLookup, setIsZipLookup] = useState(true);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [zipLookupError, setZipLookupError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Get saved locations from localStorage safely on initial load
  // If none found, use the default locations
  const [savedLocations, setSavedLocations] = useState<Location[]>(() => {
    const storedLocations = safeLocalStorage.getItem('moontide-locations', null);
    // If we got actual locations back and it's an array with entries, use them
    if (storedLocations && Array.isArray(storedLocations) && storedLocations.length > 0) {
      return storedLocations;
    }
    // Otherwise fall back to default locations
    return defaultLocations;
  });

  // Save locations to localStorage safely when they change
  useEffect(() => {
    // Only try to save if we have non-default locations
    // This prevents overwriting the memory storage with an empty array
    if (savedLocations.length > 0) {
      safeLocalStorage.setItem('moontide-locations', savedLocations);
      console.log("Saved locations updated:", savedLocations);
    }
  }, [savedLocations]);

  // Log current location for debugging
  useEffect(() => {
    console.log("Current location in LocationSelector:", currentLocation);
  }, [currentLocation]);

  const filteredLocations = savedLocations.filter(location => {
    const query = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(query) ||
      location.country.toLowerCase().includes(query) ||
      (location.zipCode && location.zipCode.toLowerCase().includes(query))
    );
  });

  // Delete a location
  const deleteLocation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent dropdown item click
    const updatedLocations = savedLocations.filter(loc => loc.id !== id);
    setSavedLocations(updatedLocations);
    safeLocalStorage.setItem('moontide-locations', updatedLocations);
    toast.success("Location deleted");
  };

  const selectLocation = (location: Location) => {
    console.log("Selecting location:", location);
    onLocationChange(location);
    // Save current location to localStorage safely
    safeLocalStorage.setItem('moontide-current-location', location);
    setSearchQuery("");
    
    // Display confirmation toast with the location name
    toast.success(`Location set to ${location.name}${location.zipCode ? ` (${location.zipCode})` : `, ${location.country}`}`);
  };

  const resetForm = () => {
    setLocationName("");
    setLocationCountry("USA");
    setLocationZipCode("");
    setZipLookupError(null);
    setIsZipLookup(true);
    setIsFormOpen(false);
  };

  // Unified location submission handler
  const handleLocationSubmit = async () => {
    if (isZipLookup) {
      await handleZipLookup();
    } else {
      handleManualEntry();
    }
  };

  const handleManualEntry = () => {
    if (!locationName.trim()) {
      toast.error("Please enter a location name");
      return;
    }
    
    if (!locationCountry.trim()) {
      toast.error("Please enter a country");
      return;
    }

    // Create the new location
    const newLocation: Location = {
      id: `custom-${Date.now()}`,
      name: locationName.trim(),
      country: locationCountry.trim(),
      zipCode: locationZipCode.trim() || undefined
    };

    // Add to saved locations
    const updatedLocations = [...savedLocations, newLocation];
    setSavedLocations(updatedLocations);
    safeLocalStorage.setItem('moontide-locations', updatedLocations);
    
    // Select the new location
    selectLocation(newLocation);
    
    // Reset form
    resetForm();
    
    toast.success(`Added ${newLocation.name}`);
  };

  const handleZipLookup = async () => {
    if (!locationZipCode.trim()) {
      toast.error("Please enter a ZIP code");
      return;
    }

    setIsLookingUp(true);
    setZipLookupError(null);
    
    try {
      const zipCode = locationZipCode.trim();
      
      // Check if this ZIP code already exists
      const zipExists = savedLocations.some(
        location => location.zipCode === zipCode
      );
      
      if (zipExists) {
        toast.error("This ZIP code already exists in your locations");
        setIsLookingUp(false);
        return;
      }
      
      // Attempt to look up the ZIP code
      const zipData = await lookupZipCode(zipCode);
      
      if (zipData) {
        const formattedCityState = formatCityStateFromZip(zipData);
        
        // Create the new location
        const newLocation: Location = {
          id: `zip-${Date.now()}`,
          name: `${zipData.city}, ${zipData.state}`,
          country: "USA",
          zipCode: zipCode
        };
        
        // Add the location
        const updatedLocations = [...savedLocations, newLocation];
        setSavedLocations(updatedLocations);
        safeLocalStorage.setItem('moontide-locations', updatedLocations);
        
        // Select the new location
        selectLocation(newLocation);
        
        toast.success(`Added ${formattedCityState} (${zipCode})`);
        resetForm();
      } else {
        // ZIP code not found - switch to manual entry mode
        setZipLookupError(`ZIP code ${zipCode} not found. Enter location details manually.`);
        setIsZipLookup(false);
        // Pre-populate the ZIP code field
        setLocationName("");
        // Keep the zipCode field as is
      }
    } catch (error) {
      console.error('Error during ZIP lookup:', error);
      setZipLookupError("Error looking up ZIP code. Please try again or enter details manually.");
    } finally {
      setIsLookingUp(false);
    }
  };

  // Get state abbreviation (used for manually entered locations)
  const getStateAbbreviation = (stateName: string) => {
    const stateMap: Record<string, string> = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    
    return stateMap[stateName] || stateName;
  };

  // Handle toggle between ZIP lookup and manual entry
  const toggleEntryMode = () => {
    setIsZipLookup(!isZipLookup);
    setZipLookupError(null);
  };

  return (
    <div className="flex items-center gap-2 bg-muted/50 backdrop-blur-sm p-2 rounded-lg">
      {isFormOpen ? (
        <div className="flex-1 flex flex-col gap-2">
          {/* Unified Location Form */}
          <div className="flex gap-2 items-center">
            <div className="text-xs text-muted-foreground">
              {isZipLookup ? 'ZIP Lookup' : 'Manual Entry'}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleEntryMode}
              className="text-xs ml-auto py-1 h-auto"
            >
              Switch to {isZipLookup ? 'Manual Entry' : 'ZIP Lookup'}
            </Button>
          </div>

          {isZipLookup ? (
            // ZIP Code Lookup Form
            <div className="flex gap-2">
              <Input
                placeholder="Enter ZIP Code"
                value={locationZipCode}
                onChange={(e) => setLocationZipCode(e.target.value)}
                className="bg-background/50 border-muted"
                autoFocus
              />
            </div>
          ) : (
            // Manual Entry Form
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Location name"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="bg-background/50 border-muted"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Country"
                  value={locationCountry}
                  onChange={(e) => setLocationCountry(e.target.value)}
                  className="bg-background/50 border-muted"
                />
                <Input
                  placeholder="ZIP Code (optional)"
                  value={locationZipCode}
                  onChange={(e) => setLocationZipCode(e.target.value)}
                  className="bg-background/50 border-muted w-1/3"
                />
              </div>
            </>
          )}
          
          {zipLookupError && (
            <div className="text-sm text-amber-400 mb-1">
              {zipLookupError}
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              onClick={resetForm}
              className="hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleLocationSubmit}
              disabled={isLookingUp}
              className="bg-moon-primary hover:bg-moon-primary/90"
            >
              {isLookingUp ? "Looking up..." : (isZipLookup ? "Lookup & Save" : "Save")}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ChevronDown size={16} className="text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 p-1 hover:bg-muted">
                Change
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card/90 backdrop-blur-lg border-muted">
              {/* Search locations */}
              <div className="px-2 py-1.5">
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 border-muted h-8 text-sm"
                />
              </div>
              
              {/* Location list */}
              {filteredLocations.length === 0 && (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center italic">
                  No locations found
                </div>
              )}
              
              {filteredLocations.map((location) => (
                <DropdownMenuItem 
                  key={location.id}
                  className="flex justify-between cursor-pointer hover:bg-muted focus:bg-muted group"
                >
                  <div onClick={() => selectLocation(location)}>
                    {location.name}
                    {location.zipCode && ` (${location.zipCode})`}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteLocation(location.id, e)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))}
              
              {/* Add new location button */}
              <DropdownMenuItem 
                onClick={() => setIsFormOpen(true)}
                className="cursor-pointer hover:bg-muted focus:bg-muted"
              >
                <Plus size={14} className="mr-2" /> Add location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
};

export default LocationSelector;
