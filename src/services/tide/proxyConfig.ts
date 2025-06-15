
// Configuration for NOAA API proxy settings
export interface ProxyConfig {
  useLocalProxy: boolean;
  localProxyUrl: string;
  fallbackProxyUrl: string;
}

// Default configuration - prioritizes local proxy for full control
export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  useLocalProxy: true, // Default to local proxy when available
  localProxyUrl: 'http://localhost:3001/api/noaa',
  fallbackProxyUrl: 'https://api.allorigins.win/raw?url='
};

// Get current proxy configuration (can be extended to read from localStorage/env vars)
export function getProxyConfig(): ProxyConfig {
  // For now, return default config
  // Later you can extend this to read from environment variables or localStorage
  return DEFAULT_PROXY_CONFIG;
}

// Toggle proxy mode (useful for debugging/testing)
export function toggleProxyMode(): ProxyConfig {
  const config = getProxyConfig();
  return {
    ...config,
    useLocalProxy: !config.useLocalProxy
  };
}
