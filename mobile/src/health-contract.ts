export type HealthProvider = 'apple' | 'health-connect' | 'samsung';
export interface HealthEntry {
  id?: string; date: string; sleep?: number; steps?: number; activeMinutes?: number;
  calories?: number; restingHR?: number; hrv?: number; energy?: number; stress?: number;
}
export interface SigmaHealthPlugin {
  isAvailable(options: { provider: HealthProvider }): Promise<{ available: boolean; platform: string; reason?: string }>;
  requestAuthorization(options: { provider: HealthProvider; metrics: string[] }): Promise<{ granted: boolean; metrics: string[] }>;
  readSummary(options: { provider: HealthProvider; days: number }): Promise<{ entries: HealthEntry[] }>;
}
