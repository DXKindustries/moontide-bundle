
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, RefreshCw, Database, Info } from 'lucide-react';
import { cacheService } from '@/services/cacheService';
import { clearGeocodingCache, getCacheStats } from '@/services/geocodingService';
import { toast } from 'sonner';

interface CacheEntryStats {
  key: string;
  age: number;
  ttl: number;
}

interface CacheStats {
  size: number;
  entries: CacheEntryStats[];
}

export default function CacheManagement() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      
      setStats({ size: 0, entries: [] });
      toast.error('Failed to load cache statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const handleClearCache = async () => {
    try {
      setIsLoading(true);
      clearGeocodingCache();
      setRefreshKey(prev => prev + 1);
      toast.success('Cache cleared successfully');
    } catch (error) {
      
      toast.error('Failed to clear cache');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Cache stats refreshed');
  };

  const formatTime = (ms: number) => {
    if (ms < 0) return 'Expired';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleClearCache} 
            variant="destructive" 
            size="sm"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading cache statistics...</span>
          </div>
        )}

        {/* Stats Display */}
        {!isLoading && stats && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Total Entries</div>
                <div className="text-2xl font-bold">{stats.size || 0}</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Cache Type</div>
                <div className="text-lg font-semibold">In-Memory</div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="text-lg font-semibold text-green-600">Active</div>
              </div>
            </div>

            {/* Cache Entries */}
            {stats.entries && stats.entries.length > 0 ? (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Cache Entries ({stats.entries.length})
                </h4>
                <div className="max-h-80 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {stats.entries.map((entry: CacheEntryStats, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="font-mono text-xs truncate text-blue-600">
                          {entry.key}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Age: {formatTime(entry.age)}
                        </div>
                      </div>
                      <div className="text-xs text-right">
                        <div className={`font-medium ${entry.ttl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.ttl > 0 ? `TTL: ${formatTime(entry.ttl)}` : 'Expired'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 bg-muted/30 rounded-lg">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <div className="text-lg font-medium">No cache entries found</div>
                <div className="text-sm mt-1">The cache is empty or all entries have expired</div>
              </div>
            )}

            {/* Cache Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">About the Cache System</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Stores geocoding results to reduce API calls</li>
                    <li>• ZIP code lookups cached for 7 days</li>
                    <li>• City/state lookups cached for 1 day</li>
                    <li>• Cache is stored in memory and cleared on page refresh</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !stats && (
          <div className="text-center text-red-600 py-8">
            <div className="text-lg font-medium">Failed to load cache statistics</div>
            <div className="text-sm mt-1">Please try refreshing the page</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
