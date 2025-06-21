
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, RefreshCw, Database } from 'lucide-react';
import { cacheService } from '@/services/cacheService';
import { clearGeocodingCache, getCacheStats } from '@/services/geocodingService';
import { toast } from 'sonner';

export default function CacheManagement() {
  const [stats, setStats] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStats = () => {
    const cacheStats = getCacheStats();
    setStats(cacheStats);
  };

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  const handleClearCache = () => {
    clearGeocodingCache();
    setRefreshKey(prev => prev + 1);
    toast.success('Cache cleared successfully');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Cache stats refreshed');
  };

  const formatTime = (ms: number) => {
    if (ms < 0) return 'Expired';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleClearCache} variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded">
                <div className="text-sm font-medium">Total Entries</div>
                <div className="text-2xl font-bold">{stats.size}</div>
              </div>
              <div className="bg-muted p-3 rounded">
                <div className="text-sm font-medium">Cache Type</div>
                <div className="text-lg font-semibold">In-Memory</div>
              </div>
            </div>

            {stats.entries.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Cache Entries</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {stats.entries.map((entry: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                      <div className="font-mono text-xs truncate flex-1 mr-2">
                        {entry.key}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        TTL: {formatTime(entry.ttl)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
