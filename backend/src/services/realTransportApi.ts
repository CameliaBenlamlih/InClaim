import axios from 'axios';

/**
 * Real Transport Status API
 * Integrates with AviationStack for real flight data
 * Falls back to mock data if API key is not configured
 */

export type TransportStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED';

export interface TransportStatusResponse {
  status: TransportStatus;
  delayMinutes: number;
  cancelled: boolean;
  scheduledTime: number;
  actualTime: number | null;
  source: string;
  rawData?: any;
}

export interface FlightData {
  flight: {
    iata: string;
    number: string;
  };
  flight_status: string;
  departure: {
    scheduled: string;
    actual: string | null;
    delay: number | null;
  };
  arrival: {
    scheduled: string;
    actual: string | null;
    delay: number | null;
  };
}

export class RealTransportAPI {
  private apiKey: string | undefined;
  private baseUrl = 'http://api.aviationstack.com/v1';
  private useMockFallback: boolean;

  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY;
    this.useMockFallback = !this.apiKey;

    if (this.useMockFallback) {
      console.log('⚠️  RealTransportAPI: No API key configured, using mock fallback');
      console.log('   Set AVIATIONSTACK_API_KEY in .env for real flight data');
    } else {
      console.log('✅ RealTransportAPI: AviationStack API configured');
      console.log(`   API Key: ${this.apiKey.substring(0, 8)}...`);
    }
  }

  /**
   * Get transport status for a trip
   * Supports flight numbers (e.g., "BA123", "AF1234")
   * For trains, falls back to mock data
   */
  async getStatus(tripIdHash: string, travelDate: number): Promise<TransportStatusResponse> {
    // If no API key, use mock fallback
    if (this.useMockFallback) {
      return this.getMockStatus(tripIdHash, travelDate);
    }

    // Extract trip ID from hash (this is a demo - in production, store mapping)
    // For demo, we'll try to fetch any flight or use a default test flight
    const testFlightCode = process.env.TEST_FLIGHT_CODE || 'BA123';

    try {
      console.log(`\n📡 Fetching real flight data from AviationStack...`);
      console.log(`   Flight code: ${testFlightCode}`);
      
      const flightData = await this.fetchFlightData(testFlightCode);
      
      if (flightData) {
        const response = this.parseFlightData(flightData, travelDate);
        console.log(`✅ Real flight data retrieved: ${response.status}, ${response.delayMinutes}min delay`);
        return response;
      }

      // If no data found, fall back to mock
      console.log('⚠️  No real flight data found, using mock fallback');
      return this.getMockStatus(tripIdHash, travelDate);

    } catch (error: any) {
      console.error('❌ Error fetching real flight data:', error.message);
      console.log('   Falling back to mock data');
      return this.getMockStatus(tripIdHash, travelDate);
    }
  }

  /**
   * Fetch flight data from AviationStack API
   */
  private async fetchFlightData(flightCode: string): Promise<FlightData | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/flights`, {
        params: {
          access_key: this.apiKey,
          flight_iata: flightCode,
          limit: 1,
        },
        timeout: 10000,
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }

      return null;
    } catch (error: any) {
      if (error.response) {
        console.error(`AviationStack API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
      throw error;
    }
  }

  /**
   * Parse AviationStack flight data into our format
   */
  private parseFlightData(flight: FlightData, scheduledTime: number): TransportStatusResponse {
    const status = flight.flight_status.toLowerCase();
    
    // Determine if cancelled
    const cancelled = status === 'cancelled';
    
    // Calculate delay in minutes
    let delayMinutes = 0;
    if (flight.departure.delay) {
      delayMinutes = Math.abs(flight.departure.delay);
    } else if (flight.arrival.delay) {
      delayMinutes = Math.abs(flight.arrival.delay);
    }

    // Determine status
    let transportStatus: TransportStatus;
    if (cancelled) {
      transportStatus = 'CANCELLED';
    } else if (delayMinutes >= 15) {
      transportStatus = 'DELAYED';
    } else {
      transportStatus = 'ON_TIME';
    }

    // Calculate actual time
    let actualTime: number | null = scheduledTime;
    if (cancelled) {
      actualTime = null;
    } else if (delayMinutes > 0) {
      actualTime = scheduledTime + (delayMinutes * 60);
    }

    return {
      status: transportStatus,
      delayMinutes,
      cancelled,
      scheduledTime,
      actualTime,
      source: 'AviationStack Real API',
      rawData: {
        flightIata: flight.flight.iata,
        flightNumber: flight.flight.number,
        flightStatus: flight.flight_status,
        departureScheduled: flight.departure.scheduled,
        departureActual: flight.departure.actual,
        departureDelay: flight.departure.delay,
      },
    };
  }

  /**
   * Mock fallback when no API key is configured
   */
  private getMockStatus(tripIdHash: string, travelDate: number): TransportStatusResponse {
    const defaultStatus = (process.env.MOCK_DEFAULT_STATUS as TransportStatus) || 'DELAYED';
    const defaultDelayMinutes = parseInt(process.env.MOCK_DEFAULT_DELAY_MINUTES || '90');

    const delayMinutes = defaultStatus === 'DELAYED' ? defaultDelayMinutes : 0;
    const cancelled = defaultStatus === 'CANCELLED';

    return {
      status: defaultStatus,
      delayMinutes,
      cancelled,
      scheduledTime: travelDate,
      actualTime: cancelled ? null : travelDate + (delayMinutes * 60),
      source: 'Mock API (Fallback)',
    };
  }

  /**
   * Test API connection and return status
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'No API key configured. Set AVIATIONSTACK_API_KEY in .env',
      };
    }

    try {
      const testFlight = process.env.TEST_FLIGHT_CODE || 'BA123';
      const data = await this.fetchFlightData(testFlight);
      
      if (data) {
        return {
          success: true,
          message: `Successfully connected to AviationStack API. Test flight ${testFlight} retrieved.`,
          data: {
            flightIata: data.flight.iata,
            status: data.flight_status,
            delay: data.departure.delay || data.arrival.delay || 0,
          },
        };
      }

      return {
        success: false,
        message: 'Connected to API but no flight data found. Try a different TEST_FLIGHT_CODE.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if using real API or mock fallback
   */
  isUsingRealAPI(): boolean {
    return !this.useMockFallback;
  }

  /**
   * Get API status info
   */
  getStatus(): object {
    return {
      mode: this.useMockFallback ? 'mock' : 'real',
      apiConfigured: !!this.apiKey,
      source: this.useMockFallback ? 'Mock fallback data' : 'AviationStack API',
      note: this.useMockFallback 
        ? 'Configure AVIATIONSTACK_API_KEY for real flight data'
        : 'Using real flight data from AviationStack',
    };
  }
}
