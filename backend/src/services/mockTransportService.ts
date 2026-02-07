import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

interface TransportStatus {
  tripId: string;
  date: string;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  delayMinutes: number;
  cancelled: boolean;
}

interface TripConfig {
  status: string;
  delayMinutes: number;
  cancelled: boolean;
}

export class MockTransportService {
  private tripConfigs: Map<string, TripConfig> = new Map();
  private defaultStatus: string;
  private defaultDelayMinutes: number;

  constructor() {
    this.defaultStatus = process.env.MOCK_DEFAULT_STATUS || 'DELAYED';
    this.defaultDelayMinutes = parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90');

    console.log('MockTransportService initialized');
    console.log('  Default status:', this.defaultStatus);
    console.log('  Default delay:', this.defaultDelayMinutes, 'minutes');

    this.setupDemoTrips();
  }

  
  private setupDemoTrips(): void {
    this.tripConfigs.set('BA123', {
      status: 'DELAYED',
      delayMinutes: 120,
      cancelled: false
    });

    this.tripConfigs.set('UA456', {
      status: 'CANCELLED',
      delayMinutes: 0,
      cancelled: true
    });

    this.tripConfigs.set('IC502', {
      status: 'ON_TIME',
      delayMinutes: 15,
      cancelled: false
    });

    this.tripConfigs.set('TGV789', {
      status: 'DELAYED',
      delayMinutes: 75,
      cancelled: false
    });

    console.log('  Demo trips configured:', Array.from(this.tripConfigs.keys()).join(', '));
  }

  
  async getStatus(
    tripIdHash: string,
    travelDate: bigint
  ): Promise<{ cancelled: boolean; delayMinutes: number; status: string }> {
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const cancelled = this.defaultStatus === 'CANCELLED';
    const delayMinutes = cancelled ? 0 : this.defaultDelayMinutes;

    return {
      cancelled,
      delayMinutes,
      status: this.defaultStatus
    };
  }

  
  getStatusByTripId(tripId: string, date: string): TransportStatus {
    const config = this.tripConfigs.get(tripId.toUpperCase());

    if (config) {
      return {
        tripId,
        date,
        status: config.status as TransportStatus['status'],
        delayMinutes: config.delayMinutes,
        cancelled: config.cancelled
      };
    }

    return {
      tripId,
      date,
      status: this.defaultStatus as TransportStatus['status'],
      delayMinutes: this.defaultDelayMinutes,
      cancelled: this.defaultStatus === 'CANCELLED'
    };
  }

  
  setTripStatus(tripId: string, config: TripConfig): void {
    this.tripConfigs.set(tripId.toUpperCase(), config);
    console.log(`Configured status for ${tripId}:`, config);
  }

  
  setDefaultStatus(status: string, delayMinutes: number): void {
    this.defaultStatus = status;
    this.defaultDelayMinutes = delayMinutes;
    console.log('Updated defaults:', { status, delayMinutes });
  }

  
  getConfig(): {
    defaultStatus: string;
    defaultDelayMinutes: number;
    trips: Record<string, TripConfig>;
  } {
    const trips: Record<string, TripConfig> = {};
    this.tripConfigs.forEach((config, id) => {
      trips[id] = config;
    });

    return {
      defaultStatus: this.defaultStatus,
      defaultDelayMinutes: this.defaultDelayMinutes,
      trips
    };
  }

  
  reset(): void {
    this.tripConfigs.clear();
    this.defaultStatus = process.env.MOCK_DEFAULT_STATUS || 'DELAYED';
    this.defaultDelayMinutes = parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90');
    this.setupDemoTrips();
    console.log('MockTransportService reset to defaults');
  }
}
