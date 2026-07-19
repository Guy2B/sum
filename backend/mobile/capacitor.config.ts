import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.algbr.sigma',
  appName: 'Sigma Life OS',
  webDir: 'www',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: { launchShowDuration: 800 }
  }
};
export default config;
