// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.moontide',   // ← use your real ID
  appName: 'MoonTide',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
