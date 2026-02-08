export interface TripStatus {
  tripId: string;
  tripType: 'flight' | 'train';
  status: 'on_time' | 'delayed' | 'cancelled' | 'diverted' | 'unknown';
  scheduledDeparture: Date;
  actualDeparture?: Date;
  scheduledArrival: Date;
  actualArrival?: Date;
  delayMinutes: number;
  gate?: string;
  terminal?: string;
  platform?: string;
  lastUpdated: Date;
  dataSource: string;
}

interface StatusAdapter {
  getFlightStatus(flightNumber: string, date: Date): Promise<TripStatus>;
  getTrainStatus(trainNumber: string, date: Date): Promise<TripStatus>;
}

class MockStatusAdapter implements StatusAdapter {
  private statusSimulations = new Map<string, TripStatus>();
  
  async getFlightStatus(flightNumber: string, date: Date): Promise<TripStatus> {
    const key = `${flightNumber}-${date.toISOString().split('T')[0]}`;
    
    if (this.statusSimulations.has(key)) {
      return this.statusSimulations.get(key)!;
    }
    
    const status: TripStatus['status'] = 'delayed';
    const delayMinutes = 90;
    
    const scheduledDeparture = new Date(date);
    const actualDeparture = new Date(scheduledDeparture.getTime() + delayMinutes * 60000);
    
    const scheduledArrival = new Date(scheduledDeparture.getTime() + 2 * 3600000);
    const actualArrival = new Date(actualDeparture.getTime() + 2 * 3600000);
    
    const tripStatus: TripStatus = {
      tripId: flightNumber,
      tripType: 'flight',
      status,
      scheduledDeparture,
      actualDeparture,
      scheduledArrival,
      actualArrival,
      delayMinutes,
      gate: `${Math.floor(Math.random() * 50) + 1}`,
      terminal: ['1', '2', '3', '4', '5'][Math.floor(Math.random() * 5)],
      lastUpdated: new Date(),
      dataSource: 'Mock Flight Status API',
    };
    
    this.statusSimulations.set(key, tripStatus);
    return tripStatus;
  }
  
  async getTrainStatus(trainNumber: string, date: Date): Promise<TripStatus> {
    const key = `${trainNumber}-${date.toISOString().split('T')[0]}`;
    
    if (this.statusSimulations.has(key)) {
      return this.statusSimulations.get(key)!;
    }
    
    const status: TripStatus['status'] = 'delayed';
    const delayMinutes = 60;
    
    const scheduledDeparture = new Date(date);
    const actualDeparture = new Date(scheduledDeparture.getTime() + delayMinutes * 60000);
    
    const scheduledArrival = new Date(scheduledDeparture.getTime() + 3 * 3600000);
    const actualArrival = new Date(actualDeparture.getTime() + 3 * 3600000);
    
    const tripStatus: TripStatus = {
      tripId: trainNumber,
      tripType: 'train',
      status,
      scheduledDeparture,
      actualDeparture,
      scheduledArrival,
      actualArrival,
      delayMinutes,
      platform: `${Math.floor(Math.random() * 12) + 1}`,
      lastUpdated: new Date(),
      dataSource: 'Mock Train Status API',
    };
    
    this.statusSimulations.set(key, tripStatus);
    return tripStatus;
  }
  
  setStatus(tripId: string, date: Date, status: Partial<TripStatus>) {
    const key = `${tripId}-${date.toISOString().split('T')[0]}`;
    const existing = this.statusSimulations.get(key);
    if (existing) {
      this.statusSimulations.set(key, { ...existing, ...status, lastUpdated: new Date() });
    }
  }
}

class RealStatusAdapter implements StatusAdapter {
  async getFlightStatus(flightNumber: string, date: Date): Promise<TripStatus> {
    throw new Error('Real flight status API not configured. Use mock adapter or add API keys.');
  }
  
  async getTrainStatus(trainNumber: string, date: Date): Promise<TripStatus> {
    throw new Error('Real train status API not configured. Use mock adapter or add API keys.');
  }
}

let adapter: StatusAdapter;

export function initializeStatusOracle(useMock: boolean = true) {
  adapter = useMock ? new MockStatusAdapter() : new RealStatusAdapter();
}

export async function getTripStatus(
  tripId: string,
  tripType: 'flight' | 'train',
  date: Date
): Promise<TripStatus> {
  if (!adapter) {
    initializeStatusOracle(true);
  }
  
  if (tripType === 'flight') {
    return adapter.getFlightStatus(tripId, date);
  } else {
    return adapter.getTrainStatus(tripId, date);
  }
}

export function getMockAdapter(): MockStatusAdapter | null {
  return adapter instanceof MockStatusAdapter ? adapter : null;
}

initializeStatusOracle(true);
