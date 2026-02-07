import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, User, Mail, Wallet, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { BACKEND_URL } from '../../lib/contract';

export default function DemoCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quote, searchParams } = location.state || {};
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerEmail: '',
  });
  
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStage, setPurchaseStage] = useState('idle'); // idle, paying, booking, complete
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  if (!quote) {
    navigate('/demo');
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      open();
      return;
    }
    
    if (!formData.passengerName || !formData.passengerEmail) {
      setError('Please fill all fields');
      return;
    }
    
    try {
      setPurchasing(true);
      setError('');
      
      // Stage 1: Payment (simulated)
      setPurchaseStage('paying');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stage 2: Booking with provider
      setPurchaseStage('booking');
      const response = await fetch(`${BACKEND_URL}/api/demo/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          passengerName: formData.passengerName,
          passengerEmail: formData.passengerEmail,
          walletAddress: address,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Purchase failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Booking failed with provider');
      }
      
      setPurchaseStage('complete');
      setBookingResult(data.booking);
      
      // Navigate to trip page after 2 seconds
      setTimeout(() => {
        navigate(`/demo/trip/${data.booking.bookingId}`, {
          state: {
            booking: data.booking,
            quote,
            searchParams,
          }
        });
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      setPurchaseStage('idle');
    } finally {
      setPurchasing(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">
          Complete Your Purchase
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Passenger Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePurchase} className="space-y-6">
                  <Input
                    label="Full Name"
                    name="passengerName"
                    value={formData.passengerName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    icon={User}
                    required
                    disabled={purchasing}
                  />
                  
                  <Input
                    label="Email Address"
                    name="passengerEmail"
                    type="email"
                    value={formData.passengerEmail}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    icon={Mail}
                    required
                    disabled={purchasing}
                  />

                  {/* Wallet Connection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Wallet className="w-4 h-4 inline mr-2" />
                      Payment Wallet
                    </label>
                    {isConnected ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-mono text-sm">
                            {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Button type="button" onClick={() => open()} variant="secondary" className="w-full">
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Purchase Progress */}
                  {purchasing && (
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <div className="flex-1">
                            {purchaseStage === 'paying' && (
                              <p className="font-medium text-blue-900">Processing payment...</p>
                            )}
                            {purchaseStage === 'booking' && (
                              <p className="font-medium text-blue-900">Booking with {quote.providerName}...</p>
                            )}
                            {purchaseStage === 'complete' && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="font-medium text-green-900">Booking confirmed!</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {bookingResult && (
                          <div className="pt-4 border-t border-blue-300">
                            <p className="text-sm text-blue-900 mb-2">
                              <strong>PNR:</strong> {bookingResult.bookingId}
                            </p>
                            <p className="text-sm text-blue-700">
                              Confirmation email sent to {formData.passengerEmail}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={!isConnected || purchasing}
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Pay ${quote.currentPrice * searchParams.passengers} & Book
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Funds locked in blockchain escrow. Automatic refunds via FDC verification.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Trip Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Provider</p>
                  <p className="font-semibold text-gray-900">{quote.providerName}</p>
                  <p className="text-sm text-gray-600">{quote.tripId}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Route</p>
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-gray-900">{formatTime(quote.departureTime)}</p>
                      <p className="text-sm text-gray-600">{searchParams.originName}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-primary-200">
                      <p className="text-xs text-gray-500">{quote.tripType === 'flight' ? '✈️' : '🚂'} Direct</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatTime(quote.arrivalTime)}</p>
                      <p className="text-sm text-gray-600">{searchParams.destinationName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Fare Class</p>
                  <p className="font-medium text-gray-900">{quote.fareClass}</p>
                </div>

                {quote.baggage && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Baggage</p>
                    <p className="font-medium text-gray-900">{quote.baggage}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Passengers</p>
                  <p className="font-medium text-gray-900">{searchParams.passengers}</p>
                </div>

                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm text-gray-500">Price per passenger</p>
                    <p className="font-medium text-gray-900">${quote.currentPrice}</p>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-gray-900">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(quote.currentPrice * searchParams.passengers).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">USDC</p>
                </div>

                <div className="pt-4 border-t border-gray-200 bg-primary-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                  <p className="text-xs text-primary-900 font-medium mb-2">
                    🛡️ Protected by InClaim
                  </p>
                  <ul className="text-xs text-primary-700 space-y-1">
                    <li>• 3-23h delay: 20% refund</li>
                    <li>• ≥24h delay: 50% refund</li>
                    <li>• Cancellation: 100% refund</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
