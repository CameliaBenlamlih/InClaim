/**
 * Provider Quotes Service (Mock)
 * Simulates airline/train company price quotes with dynamic pricing
 */

export interface QuoteProvider {
  id: string;
  name: string;
  type: 'flight' | 'train';
  logo?: string;
}

export interface Quote {
  id: string;
  providerId: string;
  providerName: string;
  tripType: 'flight' | 'train';
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  basePrice: number; // USDC
  currentPrice: number; // Dynamic price
  currency: 'USDC';
  fareClass?: string;
  baggage?: string;
  cancellationPolicy?: string;
  seatsAvailable: number;
  tripId: string; // Flight number or train number
  lastUpdated: Date;
}

// Mock providers
const PROVIDERS: QuoteProvider[] = [
  { id: 'BA', name: 'British Airways', type: 'flight' },
  { id: 'AF', name: 'Air France', type: 'flight' },
  { id: 'LH', name: 'Lufthansa', type: 'flight' },
  { id: 'EK', name: 'Emirates', type: 'flight' },
  { id: 'EUROSTAR', name: 'Eurostar', type: 'train' },
  { id: 'SNCF', name: 'SNCF', type: 'train' },
  { id: 'DB', name: 'Deutsche Bahn', type: 'train' },
];

// Price volatility simulation
const priceVolatilityCache = new Map<string, number>();

function getPriceWithVolatility(basePrice: number, quoteId: string): number {
  // Simulate dynamic pricing - prices change ±5% over time
  const now = Date.now();
  const seed = `${quoteId}-${Math.floor(now / 10000)}`; // Changes every 10s
  
  let volatility = priceVolatilityCache.get(seed);
  if (!volatility) {
    volatility = (Math.random() - 0.5) * 0.1; // -5% to +5%
    priceVolatilityCache.set(seed, volatility);
  }
  
  return Math.round(basePrice * (1 + volatility) * 100) / 100;
}

export async function searchQuotes(params: {
  origin: string;
  destination: string;
  date: string;
  tripType: 'flight' | 'train';
  passengers?: number;
}): Promise<Quote[]> {
  const { origin, destination, date, tripType, passengers = 1 } = params;
  
  // Filter providers by type
  const relevantProviders = PROVIDERS.filter(p => p.type === tripType);
  
  // Generate quotes from each provider
  const quotes: Quote[] = [];
  const departureDate = new Date(date);
  
  for (const provider of relevantProviders) {
    // Generate 2-3 options per provider (different times/prices)
    const numOptions = Math.floor(Math.random() * 2) + 2;
    
    for (let i = 0; i < numOptions; i++) {
      const departureTime = new Date(departureDate);
      departureTime.setHours(6 + i * 4 + Math.floor(Math.random() * 3));
      
      const duration = tripType === 'flight' 
        ? 1.5 + Math.random() * 2 // 1.5-3.5 hours
        : 2 + Math.random() * 4; // 2-6 hours
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setHours(arrivalTime.getHours() + Math.floor(duration));
      arrivalTime.setMinutes(arrivalTime.getMinutes() + Math.round((duration % 1) * 60));
      
      // Base price calculation
      const basePrice = tripType === 'flight'
        ? 150 + Math.random() * 300 // $150-450
        : 50 + Math.random() * 150; // $50-200
      
      const quoteId = `${provider.id}-${origin}-${destination}-${i}-${date}`;
      const currentPrice = getPriceWithVolatility(basePrice, quoteId);
      
      const fareClasses = tripType === 'flight' 
        ? ['Economy', 'Premium Economy', 'Business']
        : ['Second Class', 'First Class'];
      const fareClass = fareClasses[Math.min(i, fareClasses.length - 1)];
      
      quotes.push({
        id: quoteId,
        providerId: provider.id,
        providerName: provider.name,
        tripType,
        origin,
        destination,
        departureTime,
        arrivalTime,
        basePrice: Math.round(basePrice * 100) / 100,
        currentPrice,
        currency: 'USDC',
        fareClass,
        baggage: tripType === 'flight' ? '1x23kg checked bag' : '2 bags included',
        cancellationPolicy: 'Refundable with fee',
        seatsAvailable: 5 + Math.floor(Math.random() * 20),
        tripId: tripType === 'flight' 
          ? `${provider.id}${Math.floor(100 + Math.random() * 900)}`
          : `${provider.id}${Math.floor(1000 + Math.random() * 9000)}`,
        lastUpdated: new Date(),
      });
    }
  }
  
  // Sort by price
  return quotes.sort((a, b) => a.currentPrice - b.currentPrice);
}

export async function getQuoteById(quoteId: string): Promise<Quote | null> {
  // In a real system, this would query a database
  // For demo, we'll reconstruct from the ID
  const parts = quoteId.split('-');
  if (parts.length < 4) return null;
  
  const providerId = parts[0];
  const provider = PROVIDERS.find(p => p.id === providerId);
  if (!provider) return null;
  
  // Reconstruct quote with current volatile price
  const basePrice = 200; // Simplified for demo
  const currentPrice = getPriceWithVolatility(basePrice, quoteId);
  
  return {
    id: quoteId,
    providerId: provider.id,
    providerName: provider.name,
    tripType: provider.type,
    origin: parts[1],
    destination: parts[2],
    departureTime: new Date(),
    arrivalTime: new Date(Date.now() + 2 * 3600000),
    basePrice,
    currentPrice,
    currency: 'USDC',
    fareClass: 'Economy',
    baggage: '1x23kg checked bag',
    cancellationPolicy: 'Refundable with fee',
    seatsAvailable: 10,
    tripId: `${providerId}123`,
    lastUpdated: new Date(),
  };
}

export async function refreshQuote(quoteId: string): Promise<Quote | null> {
  // Clear cache to force price refresh
  const now = Date.now();
  const seed = `${quoteId}-${Math.floor(now / 10000)}`;
  priceVolatilityCache.delete(seed);
  
  return getQuoteById(quoteId);
}
