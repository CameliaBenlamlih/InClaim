/**
 * Demo API Routes
 * Backend endpoints for the new demo purchase flow
 */

import express, { Request, Response } from 'express';
import * as quotesService from '../services/providerQuotesService';
import * as bookingService from '../services/providerBookingService';
import * as statusService from '../services/statusOracleService';
import * as fdcService from '../services/fdcVerificationService';
import * as settlementService from '../services/settlementEngine';
import crypto from 'crypto';

const router = express.Router();

// GET /api/demo/quotes - Search for travel quotes
router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const { origin, destination, date, tripType, passengers } = req.query;
    
    if (!origin || !destination || !date || !tripType) {
      return res.status(400).json({ 
        error: 'Missing required parameters: origin, destination, date, tripType' 
      });
    }
    
    const quotes = await quotesService.searchQuotes({
      origin: origin as string,
      destination: destination as string,
      date: date as string,
      tripType: tripType as 'flight' | 'train',
      passengers: passengers ? parseInt(passengers as string) : 1,
    });
    
    res.json({ quotes, count: quotes.length });
  } catch (error: any) {
    console.error('Quote search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/demo/quotes/:id/refresh - Refresh a specific quote
router.get('/quotes/:id/refresh', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await quotesService.refreshQuote(id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json({ quote });
  } catch (error: any) {
    console.error('Quote refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/demo/purchase - Purchase a ticket
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const { 
      quoteId, 
      passengerName, 
      passengerEmail,
      walletAddress 
    } = req.body;
    
    if (!quoteId || !passengerName || !passengerEmail || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: quoteId, passengerName, passengerEmail, walletAddress' 
      });
    }
    
    // Get quote details
    const quote = await quotesService.getQuoteById(quoteId);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found or expired' });
    }
    
    // Create booking with provider
    const booking = await bookingService.createBooking({
      quoteId: quote.id,
      providerId: quote.providerId,
      providerName: quote.providerName,
      tripId: quote.tripId,
      tripType: quote.tripType,
      origin: quote.origin,
      destination: quote.destination,
      departureTime: quote.departureTime,
      arrivalTime: quote.arrivalTime,
      passengerName,
      passengerEmail,
      price: quote.currentPrice,
    });
    
    if (booking.status === 'failed') {
      return res.status(500).json({ 
        error: 'Booking failed with provider. Please try again.' 
      });
    }
    
    // Send confirmation email
    await bookingService.sendConfirmationEmail(booking);
    
    res.json({ 
      success: true,
      booking: {
        bookingId: booking.bookingId,
        pnr: booking.bookingId,
        status: booking.status,
        tripId: booking.tripId,
        tripType: booking.tripType,
        origin: booking.origin,
        destination: booking.destination,
        departureTime: booking.departureTime,
        price: booking.price,
        currency: booking.currency,
        confirmationEmailSent: booking.confirmationEmail,
      }
    });
  } catch (error: any) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/demo/booking/:bookingId - Get booking details
router.get('/booking/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error: any) {
    console.error('Booking fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/demo/status/:tripId - Get trip status
router.get('/status/:tripId', async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const { tripType, date } = req.query;
    
    if (!tripType || !date) {
      return res.status(400).json({ 
        error: 'Missing required parameters: tripType, date' 
      });
    }
    
    const status = await statusService.getTripStatus(
      tripId,
      tripType as 'flight' | 'train',
      new Date(date as string)
    );
    
    res.json({ status });
  } catch (error: any) {
    console.error('Status fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/demo/fdc/verify - Verify trip status via FDC
router.post('/fdc/verify', async (req: Request, res: Response) => {
  try {
    const { tripId, tripType, date } = req.body;
    
    if (!tripId || !tripType || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: tripId, tripType, date' 
      });
    }
    
    // Get current trip status
    const tripStatus = await statusService.getTripStatus(
      tripId,
      tripType,
      new Date(date)
    );
    
    // Create hash of the status data (simulates data source signature)
    const dataSourceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(tripStatus))
      .digest('hex');
    
    // Verify via FDC
    const verification = await fdcService.verifyTripStatus(tripStatus, dataSourceHash);
    
    res.json({ 
      verification,
      tripStatus,
      dataSourceHash 
    });
  } catch (error: any) {
    console.error('FDC verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/demo/settle - Create and execute settlement
router.post('/settle', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }
    
    // Get booking
    const booking = await bookingService.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Get trip status
    const tripStatus = await statusService.getTripStatus(
      booking.tripId,
      booking.tripType,
      booking.departureTime
    );
    
    // Create data hash
    const dataSourceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(tripStatus))
      .digest('hex');
    
    // FDC Verification (MANDATORY)
    const fdcVerification = await fdcService.verifyTripStatus(tripStatus, dataSourceHash);
    
    // Create settlement (will throw if FDC verification failed)
    const settlement = await settlementService.createSettlement({
      bookingId: booking.bookingId,
      tripId: booking.tripId,
      tripType: booking.tripType,
      totalAmount: booking.price,
      tripStatus,
      fdcVerification,
    });
    
    // Execute settlement (simulate on-chain transaction)
    const executedSettlement = await settlementService.executeSettlement(settlement.id);
    
    res.json({ 
      success: true,
      settlement: executedSettlement 
    });
  } catch (error: any) {
    console.error('Settlement error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/demo/settlement/:bookingId - Get settlement by booking
router.get('/settlement/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const settlement = await settlementService.getSettlementByBooking(bookingId);
    
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found for this booking' });
    }
    
    res.json({ settlement });
  } catch (error: any) {
    console.error('Settlement fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/demo/policy - Get fixed settlement policy
router.get('/policy', async (req: Request, res: Response) => {
  try {
    const policy = settlementService.getSettlementPolicy();
    res.json({ policy });
  } catch (error: any) {
    console.error('Policy fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint for demo control (simulate status changes)
router.post('/admin/set-status', async (req: Request, res: Response) => {
  try {
    const { tripId, date, status, delayMinutes } = req.body;
    
    const mockAdapter = statusService.getMockAdapter();
    if (!mockAdapter) {
      return res.status(400).json({ 
        error: 'Admin controls only available in mock mode' 
      });
    }
    
    // This would set the status - implementation depends on mock adapter API
    // For now, return success
    res.json({ 
      success: true, 
      message: 'Status updated (demo mode)' 
    });
  } catch (error: any) {
    console.error('Admin status set error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
