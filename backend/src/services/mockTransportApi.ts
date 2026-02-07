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

  
  async getStatus(tripIdHash: string, travelDate: number): Promise<TransportStatusResponse> {
    const override = this.config.tripOverrides[tripIdHash];
    if (override) {
      return this.buildResponse(override, travelDate);
    }

    if (this.config.randomize) {
      return this.generateRandomStatus(travelDate);
    }

    return this.buildResponse({
      status: this.config.defaultStatus,
      delayMinutes: this.config.defaultStatus === 'DELAYED' ? this.config.defaultDelayMinutes : 0,
      cancelled: this.config.defaultStatus === 'CANCELLED',
    }, travelDate);
  }

  
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

  
  private generateRandomStatus(travelDate: number): TransportStatusResponse {
    const rand = Math.random();
    
    let status: TransportStatus;
    let delayMinutes: number;
    let cancelled: boolean;

    if (rand < 0.6) {
      status = 'DELAYED';
      delayMinutes = Math.floor(Math.random() * 180) + 15;
      cancelled = false;
    } else if (rand < 0.8) {
      status = 'ON_TIME';
      delayMinutes = Math.floor(Math.random() * 15);
      cancelled = false;
    } else {
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

  
  setConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('MockTransportAPI config updated:', this.config);
  }

  
  getConfig(): MockConfig {
    return { ...this.config };
  }

  
  setTripOverride(tripIdHash: string, override: Partial<TransportStatusResponse>): void {
    this.config.tripOverrides[tripIdHash] = override;
    console.log(`Set override for trip ${tripIdHash}:`, override);
  }

  
  removeTripOverride(tripIdHash: string): void {
    delete this.config.tripOverrides[tripIdHash];
    console.log(`Removed override for trip ${tripIdHash}`);
  }

  
  clearOverrides(): void {
    this.config.tripOverrides = {};
    console.log('Cleared all trip overrides');
  }
}
