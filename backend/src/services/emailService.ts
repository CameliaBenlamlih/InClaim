/**
 * Email Service - SMTP Email Sending
 * Sends booking confirmation emails via configured SMTP server
 */

import nodemailer from 'nodemailer';
import { Booking } from './providerBookingService';

// SMTP Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@inclaim.app';
const FROM_NAME = process.env.FROM_NAME || 'InClaim';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;
let testAccountInfo: { user: string; pass: string; web: string } | null = null;

async function createEtherealAccount(): Promise<{ user: string; pass: string; web: string }> {
  const testAccount = await nodemailer.createTestAccount();
  return {
    user: testAccount.user,
    pass: testAccount.pass,
    web: 'https://ethereal.email',
  };
}

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️ SMTP credentials not configured. Using Ethereal test account...');
      // Create Ethereal test account
      testAccountInfo = await createEtherealAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccountInfo.user,
          pass: testAccountInfo.pass,
        },
      });
      console.log(`📧 Ethereal test account created: ${testAccountInfo.user}`);
      console.log(`   View emails at: ${testAccountInfo.web}`);
    } else {
      // Try Gmail first
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      
      // Test connection
      try {
        await transporter.verify();
        console.log(`📧 Gmail configured for: ${SMTP_USER}`);
      } catch (error) {
        console.warn('⚠️ Gmail auth failed. Falling back to Ethereal test account...');
        testAccountInfo = await createEtherealAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccountInfo.user,
            pass: testAccountInfo.pass,
          },
        });
        console.log(`📧 Ethereal test account: ${testAccountInfo.user}`);
        console.log(`   View emails at: ${testAccountInfo.web}`);
      }
    }
  }
  return transporter;
}

export function getTestAccountInfo() {
  return testAccountInfo;
}

export async function sendBookingConfirmation(booking: Booking): Promise<boolean> {
  const transport = await getTransporter();
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const tripIcon = booking.tripType === 'flight' ? '✈️' : '🚂';
  const tripLabel = booking.tripType === 'flight' ? 'Flight' : 'Train';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">InClaim</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">File in a flash, get your cash</p>
            </td>
          </tr>
          
          <!-- Confirmation Banner -->
          <tr>
            <td style="background-color: #10b981; padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">
                ✅ Booking Confirmed!
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Dear <strong>${booking.passengerName}</strong>,
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 32px 0; line-height: 1.6;">
                Your ${tripLabel.toLowerCase()} has been successfully booked. Below are your booking details. 
                Keep this email for your records.
              </p>
              
              <!-- Booking Reference -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Booking Reference (PNR)</p>
                    <p style="color: #111827; font-size: 32px; font-weight: 700; margin: 0; font-family: monospace;">${booking.bookingId}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Trip Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f9fafb; padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0;">
                      ${tripIcon} ${tripLabel} Details
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 8px 0;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">${tripLabel} Number</p>
                          <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${booking.tripId}</p>
                        </td>
                        <td width="50%" style="padding: 8px 0;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Date</p>
                          <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">${formatDate(booking.departureTime)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 16px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="45%" style="vertical-align: top;">
                                <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">From</p>
                                <p style="color: #111827; font-size: 18px; font-weight: 700; margin: 0;">${booking.origin}</p>
                                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">${formatTime(booking.departureTime)}</p>
                              </td>
                              <td width="10%" style="text-align: center; vertical-align: middle;">
                                <p style="color: #9ca3af; font-size: 24px; margin: 0;">→</p>
                              </td>
                              <td width="45%" style="vertical-align: top; text-align: right;">
                                <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">To</p>
                                <p style="color: #111827; font-size: 18px; font-weight: 700; margin: 0;">${booking.destination}</p>
                                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">${formatTime(booking.arrivalTime)}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Payment Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #f9fafb; padding: 16px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0;">
                      💳 Payment Details
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 4px 0;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">Total Paid</p>
                        </td>
                        <td style="text-align: right; padding: 4px 0;">
                          <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">$${booking.price.toFixed(2)} ${booking.currency}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- InClaim Protection -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%); border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #5b21b6; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                      🛡️ Protected by InClaim
                    </p>
                    <p style="color: #6d28d9; font-size: 13px; margin: 0 0 8px 0; line-height: 1.6;">
                      Your booking is protected with automatic delay compensation powered by Flare's Data Connector (FDC):
                    </p>
                    <ul style="color: #7c3aed; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li><strong>3-23 hour delay:</strong> 20% automatic refund</li>
                      <li><strong>24+ hour delay:</strong> 50% automatic refund</li>
                      <li><strong>Cancellation:</strong> 100% automatic refund</li>
                    </ul>
                    <p style="color: #6d28d9; font-size: 12px; margin: 12px 0 0 0;">
                      No claims to file - refunds are processed automatically via blockchain smart contracts.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                Questions? Contact us at support@inclaim.app
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} InClaim. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textContent = `
BOOKING CONFIRMATION
====================

Dear ${booking.passengerName},

Your ${tripLabel.toLowerCase()} has been successfully booked!

BOOKING REFERENCE (PNR): ${booking.bookingId}

${tripLabel.toUpperCase()} DETAILS
-----------------
${tripLabel} Number: ${booking.tripId}
Date: ${formatDate(booking.departureTime)}

From: ${booking.origin} at ${formatTime(booking.departureTime)}
To: ${booking.destination} at ${formatTime(booking.arrivalTime)}

PAYMENT
-------
Total Paid: $${booking.price.toFixed(2)} ${booking.currency}

INCLAIM PROTECTION
------------------
Your booking is protected with automatic delay compensation:
• 3-23 hour delay: 20% automatic refund
• 24+ hour delay: 50% automatic refund  
• Cancellation: 100% automatic refund

No claims to file - refunds are processed automatically!

---
Questions? Contact us at support@inclaim.app
© ${new Date().getFullYear()} InClaim. All rights reserved.
  `;

  const mailOptions = {
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: booking.passengerEmail,
    subject: `✅ Booking Confirmed - ${booking.tripId} | PNR: ${booking.bookingId}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    
    if (!SMTP_USER || !SMTP_PASS) {
      // Log the email content when SMTP is not configured
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log(`   To: ${booking.passengerEmail}`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   PNR: ${booking.bookingId}`);
      return true;
    }
    
    console.log(`📧 Confirmation email sent to ${booking.passengerEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    return false;
  }
}

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transport = await getTransporter();
    await transport.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
