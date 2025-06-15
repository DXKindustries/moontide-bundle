
// Configuration for NOAA API proxy settings
export interface ProxyConfig {
  useLocalProxy: boolean;
  localProxyUrl: string;
  fallbackProxyUrl: string;
  corsProxyUrl: string;
}

// Updated configuration with better fallback options
export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  useLocalProxy: false, // Keep false to avoid localhost dependency
  localProxyUrl: 'http://localhost:3001/api/noaa',
  fallbackProxyUrl: 'https://corsproxy.io/?',
  corsProxyUrl: 'https://cors-anywhere.herokuapp.com/'
};

// Get current proxy configuration
export function getProxyConfig(): ProxyConfig {
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
