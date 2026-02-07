/**
 * Provider Booking Service (Mock)
 * Simulates instant booking with airline/train companies
 */

export interface Booking {
  bookingId: string; // PNR-like reference
  quoteId: string;
  providerId: string;
  providerName: string;
  tripId: string; // Flight/train number
  tripType: 'flight' | 'train';
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  passengerName: string;
  passengerEmail: string;
  price: number;
  currency: 'USDC';
  status: 'pending' | 'confirmed' | 'failed';
  confirmationEmail: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}

// In-memory booking storage (use DB in production)
const bookings = new Map<string, Booking>();

function generatePNR(): string {
  // Generate airline-style PNR (6 alphanumeric characters)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export async function createBooking(params: {
  quoteId: string;
  providerId: string;
  providerName: string;
  tripId: string;
  tripType: 'flight' | 'train';
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  passengerName: string;
  passengerEmail: string;
  price: number;
}): Promise<Booking> {
  // Simulate provider API call delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const bookingId = generatePNR();
  
  const booking: Booking = {
    bookingId,
    quoteId: params.quoteId,
    providerId: params.providerId,
    providerName: params.providerName,
    tripId: params.tripId,
    tripType: params.tripType,
    origin: params.origin,
    destination: params.destination,
    departureTime: params.departureTime,
    arrivalTime: params.arrivalTime,
    passengerName: params.passengerName,
    passengerEmail: params.passengerEmail,
    price: params.price,
    currency: 'USDC',
    status: 'pending',
    confirmationEmail: false,
    createdAt: new Date(),
  };
  
  // Simulate instant confirmation (95% success rate)
  if (Math.random() > 0.05) {
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    booking.confirmationEmail = true;
  } else {
    booking.status = 'failed';
  }
  
  bookings.set(bookingId, booking);
  
  return booking;
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  return bookings.get(bookingId) || null;
}

export async function sendConfirmationEmail(booking: Booking): Promise<boolean> {
  // Import and use real email service
  const { sendBookingConfirmation } = await import('./emailService');
  return sendBookingConfirmation(booking);
}

export function getAllBookings(): Booking[] {
  return Array.from(bookings.values());
}
