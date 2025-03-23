
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.wearabody.a0a9f2314d774e6b9b5ae3377d9fbd4e',
  appName: 'weara-body-magic',
  webDir: 'dist',
  server: {
    url: 'https://a0a9f231-4d77-4e6b-9b5a-e3377d9fbd4e.wearabodyproject.com/?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;
