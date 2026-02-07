/**
 * Mock Transport Status API
 * 
 * Simulates external flight/train status data sources for demo purposes.
 * In production, this would be replaced with real API integrations:
 * - FlightAware, FlightStats, AviationStack (flights)
 * - National Rail, Deutsche Bahn, SNCF APIs (trains)
 */

export type TransportStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

export interface TransportStatusResponse {
  status: TransportStatus;
  delayMinutes: number;
  cancelled: boolean;
  scheduledTime: number;
  actualTime: number | null;
  source: string;
}

export interface MockConfig {
  defaultStatus: TransportStatus;
  defaultDelayMinutes: number;
  randomize: boolean;
  tripOverrides: Record<string, Partial<TransportStatusResponse>>;
}

export class MockTransportAPI {
  private config: MockConfig;

  constructor() {
    // Initialize with environment variables or defaults
    this.config = {
      defaultStatus: (process.env.MOCK_DEFAULT_STATUS as TransportStatus) || 'DELAYED',
      defaultDelayMinutes: parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90'),
      randomize: false,
      tripOverrides: {},
    };

    console.log('MockTransportAPI initialized');
    console.log(`  Default status: ${this.config.defaultStatus}`);
    console.log(`  Default delay: ${this.config.defaultDelayMinutes} minutes`);
  }

  /**
   * Get transport status for a trip
   */
  async getStatus(tripIdHash: string, travelDate: number): Promise<TransportStatusResponse> {
    // Check for specific trip override
    const override = this.config.tripOverrides[tripIdHash];
    if (override) {
      return this.buildResponse(override, travelDate);
    }

    // Use random status if enabled
    if (this.config.randomize) {
      return this.generateRandomStatus(travelDate);
    }

    // Use default status
    return this.buildResponse({
      status: this.config.defaultStatus,
      delayMinutes: this.config.defaultStatus === 'DELAYED' ? this.config.defaultDelayMinutes : 0,
      cancelled: this.config.defaultStatus === 'CANCELLED',
    }, travelDate);
  }

  /**
   * Build full response from partial data
   */
  private buildResponse(
    partial: Partial<TransportStatusResponse>,
    scheduledTime: number
  ): TransportStatusResponse {
    const status = partial.status || this.config.defaultStatus;
    const delayMinutes = partial.delayMinutes ?? 
      (status === 'DELAYED' ? this.config.defaultDelayMinutes : 0);
    const cancelled = partial.cancelled ?? (status === 'CANCELLED');

    return {
      status,
      delayMinutes,
      cancelled,
      scheduledTime,
      actualTime: cancelled ? null : scheduledTime + (delayMinutes * 60),
      source: 'MockTransportAPI',
    };
  }

  /**
   * Generate random transport status
   */
  private generateRandomStatus(travelDate: number): TransportStatusResponse {
    const rand = Math.random();
    
    let status: TransportStatus;
    let delayMinutes: number;
    let cancelled: boolean;

    if (rand < 0.6) {
      // 60% chance: Delayed
      status = 'DELAYED';
      delayMinutes = Math.floor(Math.random() * 180) + 15; // 15-195 minutes
      cancelled = false;
    } else if (rand < 0.8) {
      // 20% chance: On time
      status = 'ON_TIME';
      delayMinutes = Math.floor(Math.random() * 15); // 0-14 minutes
      cancelled = false;
    } else {
      // 20% chance: Cancelled
      status = 'CANCELLED';
      delayMinutes = 0;
      cancelled = true;
    }

    return {
      status,
      delayMinutes,
      cancelled,
      scheduledTime: travelDate,
      actualTime: cancelled ? null : travelDate + (delayMinutes * 60),
      source: 'MockTransportAPI (random)',
    };
  }

  /**
   * Set mock configuration
   */
  setConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('MockTransportAPI config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): MockConfig {
    return { ...this.config };
  }

  /**
   * Set override for specific trip
   */
  setTripOverride(tripIdHash: string, override: Partial<TransportStatusResponse>): void {
    this.config.tripOverrides[tripIdHash] = override;
    console.log(`Set override for trip ${tripIdHash}:`, override);
  }

  /**
   * Remove override for specific trip
   */
  removeTripOverride(tripIdHash: string): void {
    delete this.config.tripOverrides[tripIdHash];
    console.log(`Removed override for trip ${tripIdHash}`);
  }

  /**
   * Clear all trip overrides
   */
  clearOverrides(): void {
    this.config.tripOverrides = {};
    console.log('Cleared all trip overrides');
  }
}
