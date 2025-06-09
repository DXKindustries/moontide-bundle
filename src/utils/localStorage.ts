
/**
 * Enhanced localStorage utility with reliable memory fallback
 * Maintains persistence across the session even when localStorage is not available
 */

// Memory fallback storage when localStorage is not available
// Using a global variable ensures persistence across component renders
declare global {
  interface Window {
    _memoryStorage: Record<string, any>;
  }
}

// Initialize the global memory storage if it doesn't exist
// Make sure we always have an initialized memory storage object
if (typeof window !== 'undefined') {
  if (!window._memoryStorage) {
    window._memoryStorage = {
      // Seeded with some defaults to ensure minimum functionality
      'moontide-locations': [],
      'moontide-station-map': {
        // Add Narragansett to default station map for faster access
        'narragansett': '8452660'
      }
    };
  }
}

// Get the memory storage safely
const getMemoryStorage = (): Record<string, any> => {
  if (typeof window === 'undefined') return {};
  return window._memoryStorage || (window._memoryStorage = {});
};

export const safeLocalStorage = {
  getItem: (key: string, defaultValue: any = null): any => {
    try {
      // Try localStorage first
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const value = JSON.parse(item);
        // Also update memory storage for consistency
        getMemoryStorage()[key] = value;
        return value;
      }
      
      // Fall back to memory storage if localStorage failed or item doesn't exist
      const memoryStorage = getMemoryStorage();
      if (key in memoryStorage) {
        return memoryStorage[key];
      }
      
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading ${key} from localStorage:`, error);
      
      // Fall back to memory storage
      const memoryStorage = getMemoryStorage();
      return (key in memoryStorage) ? memoryStorage[key] : defaultValue;
    }
  },
  
  setItem: (key: string, value: any): boolean => {
    // Always update memory storage first (this will work even if localStorage fails)
    getMemoryStorage()[key] = value;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing ${key} to localStorage, using memory fallback:`, error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    // Always remove from memory storage
    const memoryStorage = getMemoryStorage();
    if (key in memoryStorage) {
      delete memoryStorage[key];
    }
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },
  
  // Helper to check if localStorage is available
  isLocalStorageAvailable: (): boolean => {
    try {
      const testKey = '_test_localStorage_';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
};
