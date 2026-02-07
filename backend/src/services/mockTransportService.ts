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

/**
 * Mock Transport Status Service
 * 
 * Simulates an external transport API for demo purposes.
 * In production, this would be replaced with real APIs:
 * - Flight: FlightAware, AviationStack, FlightStats
 * - Train: National Rail, Deutsche Bahn, Amtrak APIs
 */
export class MockTransportService {
  private tripConfigs: Map<string, TripConfig> = new Map();
  private defaultStatus: string;
  private defaultDelayMinutes: number;

  constructor() {
    // Load defaults from environment
    this.defaultStatus = process.env.MOCK_DEFAULT_STATUS || 'DELAYED';
    this.defaultDelayMinutes = parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90');

    console.log('MockTransportService initialized');
    console.log('  Default status:', this.defaultStatus);
    console.log('  Default delay:', this.defaultDelayMinutes, 'minutes');

    // Pre-configure some demo trips
    this.setupDemoTrips();
  }

  /**
   * Set up demo trip configurations
   */
  private setupDemoTrips(): void {
    // Delayed flight
    this.tripConfigs.set('BA123', {
      status: 'DELAYED',
      delayMinutes: 120,
      cancelled: false
    });

    // Cancelled flight
    this.tripConfigs.set('UA456', {
      status: 'CANCELLED',
      delayMinutes: 0,
      cancelled: true
    });

    // On-time train
    this.tripConfigs.set('IC502', {
      status: 'ON_TIME',
      delayMinutes: 15,
      cancelled: false
    });

    // Delayed train
    this.tripConfigs.set('TGV789', {
      status: 'DELAYED',
      delayMinutes: 75,
      cancelled: false
    });

    console.log('  Demo trips configured:', Array.from(this.tripConfigs.keys()).join(', '));
  }

  /**
   * Get transport status by trip ID hash and date
   * Used when processing claims (we only have the hash)
   */
  async getStatus(
    tripIdHash: string,
    travelDate: bigint
  ): Promise<{ cancelled: boolean; delayMinutes: number; status: string }> {
    // In a real system, we'd look up by hash
    // For demo, we use the default configured status
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return default status (configurable via env or API)
    const cancelled = this.defaultStatus === 'CANCELLED';
    const delayMinutes = cancelled ? 0 : this.defaultDelayMinutes;

    return {
      cancelled,
      delayMinutes,
      status: this.defaultStatus
    };
  }

  /**
   * Get transport status by trip ID string and date string
   * Used by the mock API endpoint
   */
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

    // Return default for unknown trips
    return {
      tripId,
      date,
      status: this.defaultStatus as TransportStatus['status'],
      delayMinutes: this.defaultDelayMinutes,
      cancelled: this.defaultStatus === 'CANCELLED'
    };
  }

  /**
   * Configure status for a specific trip
   */
  setTripStatus(tripId: string, config: TripConfig): void {
    this.tripConfigs.set(tripId.toUpperCase(), config);
    console.log(`Configured status for ${tripId}:`, config);
  }

  /**
   * Set default status for unknown trips
   */
  setDefaultStatus(status: string, delayMinutes: number): void {
    this.defaultStatus = status;
    this.defaultDelayMinutes = delayMinutes;
    console.log('Updated defaults:', { status, delayMinutes });
  }

  /**
   * Get current configuration
   */
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

  /**
   * Reset to defaults
   */
  reset(): void {
    this.tripConfigs.clear();
    this.defaultStatus = process.env.MOCK_DEFAULT_STATUS || 'DELAYED';
    this.defaultDelayMinutes = parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90');
    this.setupDemoTrips();
    console.log('MockTransportService reset to defaults');
  }
}
