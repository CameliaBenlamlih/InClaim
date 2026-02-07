import nodemailer from 'nodemailer';
import { Booking } from './providerBookingService';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@inclaim.app';
const FROM_NAME = process.env.FROM_NAME || 'InClaim';

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
      console.warn('SMTP credentials not configured. Using Ethereal test account...');
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
      console.log(`Ethereal test account created: ${testAccountInfo.user}`);
      console.log(`   View emails at: ${testAccountInfo.web}`);
    } else {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
      
      try {
        await transporter.verify();
        console.log(`Gmail configured for: ${SMTP_USER}`);
      } catch (error) {
        console.warn('Gmail auth failed. Falling back to Ethereal test account...');
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
        console.log(`Ethereal test account: ${testAccountInfo.user}`);
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
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const tripLabel = booking.tripType === 'flight' ? 'Flight' : 'Train';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation — InClaim</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F3F2EE; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F2EE; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td style="padding: 0 0 32px 0; text-align: center;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                      <span style="color: #1A1A1A;">In</span><span style="color: #FF3B00;">Claim</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden;">

                <!-- Confirmation Header -->
                <tr>
                  <td style="padding: 36px 36px 0 36px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 36px; height: 36px; background-color: #ecfdf5; border-radius: 50%; text-align: center; line-height: 36px; font-size: 14px; color: #10b981; font-weight: bold;">OK</div>
                        </td>
                        <td style="vertical-align: top; padding-left: 12px;">
                          <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #1A1A1A; margin: 0; font-weight: 700;">Booking Confirmed</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #8A8A8A; margin: 6px 0 0 0;">Your ${tripLabel.toLowerCase()} is booked and protected by InClaim.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding: 28px 36px 0 36px;">
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #4A4A4A; margin: 0; line-height: 1.6;">
                      Dear <strong style="color: #1A1A1A;">${booking.passengerName}</strong>, your booking is confirmed. Keep this email for your records.
                    </p>
                  </td>
                </tr>

                <!-- PNR Box -->
                <tr>
                  <td style="padding: 24px 36px 0 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F2EE; border-radius: 12px;">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8A8A; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1.5px;">Booking Reference</p>
                          <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0; letter-spacing: 2px;">${booking.bookingId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Route -->
                <tr>
                  <td style="padding: 28px 36px 0 36px;">
                    <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8A8A; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1.5px;">${tripLabel} Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="42%" style="vertical-align: top;">
                          <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0;">${booking.origin}</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #8A8A8A; margin: 4px 0 0 0;">${formatTime(booking.departureTime)}</p>
                        </td>
                        <td width="16%" style="text-align: center; vertical-align: middle; padding-top: 4px;">
                          <table cellpadding="0" cellspacing="0" style="margin: 0 auto; width: 100%;">
                            <tr>
                              <td style="height: 1px; background-color: #D4D1CC;"></td>
                              <td style="width: 8px; padding: 0 2px;">
                                <div style="width: 6px; height: 6px; background-color: #FF3B00; border-radius: 50%;"></div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td width="42%" style="vertical-align: top; text-align: right;">
                          <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0;">${booking.destination}</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #8A8A8A; margin: 4px 0 0 0;">${formatTime(booking.arrivalTime)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Details Row -->
                <tr>
                  <td style="padding: 24px 36px 0 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #EEEDEA; padding-top: 20px;">
                      <tr>
                        <td width="33%" style="vertical-align: top; padding-top: 16px;">
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8A8A; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">${tripLabel} No.</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #1A1A1A; margin: 0;">${booking.tripId}</p>
                        </td>
                        <td width="34%" style="vertical-align: top; padding-top: 16px;">
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8A8A; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #1A1A1A; margin: 0;">${formatDate(booking.departureTime)}</p>
                        </td>
                        <td width="33%" style="vertical-align: top; text-align: right; padding-top: 16px;">
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8A8A; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Total Paid</p>
                          <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #1A1A1A; margin: 0;">$${booking.price.toFixed(2)}</p>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #8A8A8A; margin: 2px 0 0 0;">${booking.currency}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Protection Banner -->
                <tr>
                  <td style="padding: 28px 36px 0 36px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1A1A1A; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 24px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align: top; padding-right: 12px;">
                                <div style="width: 32px; height: 32px; background-color: rgba(255,59,0,0.15); border-radius: 8px; text-align: center; line-height: 32px; font-size: 12px; color: #FF3B00; font-weight: bold;">FDC</div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0;">Protected by InClaim</p>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #999999; margin: 0; line-height: 1.6;">
                                  Automatic compensation powered by Flare Data Connector:
                                </p>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                            <tr>
                              <td width="33%" style="padding: 8px; text-align: center; border-right: 1px solid #333;">
                                <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #FF3B00; margin: 0;">20%</p>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #777; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">3-23h delay</p>
                              </td>
                              <td width="34%" style="padding: 8px; text-align: center; border-right: 1px solid #333;">
                                <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #FF3B00; margin: 0;">50%</p>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #777; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">24h+ delay</p>
                              </td>
                              <td width="33%" style="padding: 8px; text-align: center;">
                                <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 700; color: #FF3B00; margin: 0;">100%</p>
                                <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #777; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Cancellation</p>
                              </td>
                            </tr>
                          </table>
                          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #666; margin: 16px 0 0 0; text-align: center;">
                            No claims to file — refunds are processed automatically via blockchain.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Bottom padding -->
                <tr>
                  <td style="padding: 36px;"></td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 0; text-align: center;">
              <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #8A8A8A; margin: 0 0 4px 0;">
                Questions? Contact us at support@inclaim.app
              </p>
              <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #B0B0B0; margin: 0;">
                © ${new Date().getFullYear()} InClaim — Powered by Flare Data Connector
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
    subject: `Booking Confirmed - ${booking.tripId} | PNR: ${booking.bookingId}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    
    if (!SMTP_USER || !SMTP_PASS) {
      console.log('Email would be sent (SMTP not configured):');
      console.log(`   To: ${booking.passengerEmail}`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   PNR: ${booking.bookingId}`);
      return true;
    }
    
    console.log(`Confirmation email sent to ${booking.passengerEmail}`);
    console.log(`   Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transport = await getTransporter();
    await transport.verify();
    console.log('SMTP connection verified');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}
