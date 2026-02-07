import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, Train, Clock, CheckCircle, AlertCircle, Loader2, 
  Shield, TrendingUp, Calendar, MapPin, User, Mail, 
  ExternalLink, RefreshCw, DollarSign, Lock, Zap
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BACKEND_URL } from '../../lib/contract';

export default function DemoTrip() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state;
  
  const [booking, setBooking] = useState(initialData?.booking || null);
  const [tripStatus, setTripStatus] = useState(null);
  const [fdcVerification, setFdcVerification] = useState(null);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!booking) {
      fetchBooking();
    } else {
      fetchTripStatus();
    }
  }, []);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/demo/booking/${bookingId}`);
      if (!response.ok) throw new Error('Booking not found');
      const data = await response.json();
      setBooking(data.booking);
      await fetchTripStatus(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripStatus = async (bookingData = booking) => {
    if (!bookingData) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/demo/status/${bookingData.tripId}?` + 
        new URLSearchParams({
          tripType: bookingData.tripType,
          date: bookingData.departureTime,
        })
      );
      
      if (!response.ok) throw new Error('Failed to fetch trip status');
      const data = await response.json();
      setTripStatus(data.status);
    } catch (err) {
      console.error('Status fetch error:', err);
    }
  };

  const handleVerifyFDC = async () => {
    try {
      setVerifying(true);
      setError('');
      
      const response = await fetch(`${BACKEND_URL}/api/demo/fdc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: booking.tripId,
          tripType: booking.tripType,
          date: booking.departureTime,
        }),
      });
      
      if (!response.ok) throw new Error('FDC verification failed');
      
      const data = await response.json();
      setFdcVerification(data.verification);
      setTripStatus(data.tripStatus);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleSettle = async () => {
    if (!fdcVerification || !fdcVerification.verified) {
      setError('FDC verification required before settlement');
      return;
    }
    
    try {
      setSettling(true);
      setError('');
      
      const response = await fetch(`${BACKEND_URL}/api/demo/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Settlement failed');
      }
      
      const data = await response.json();
      setSettlement(data.settlement);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSettling(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    await fetchTripStatus();
    setRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'on_time': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'delayed': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time': return 'bg-green-50 text-green-700 border-green-200';
      case 'delayed': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-4 text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'This booking could not be found'}</p>
            <Button onClick={() => navigate('/demo')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = booking.tripType === 'flight' ? Plane : Train;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-8 h-8 text-primary-600" />
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  {booking.origin} → {booking.destination}
                </h1>
              </div>
              <p className="text-gray-600">
                Booking: <span className="font-mono font-semibold">{booking.bookingId}</span>
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                booking.status === 'confirmed' 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                <span className="font-semibold capitalize">{booking.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Provider</p>
                    <p className="font-semibold text-gray-900">{booking.providerName}</p>
                    <p className="text-sm text-gray-600">{booking.tripId}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Passenger</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-gray-900">{booking.passengerName}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{booking.passengerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{formatDate(booking.departureTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatTime(booking.departureTime)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{booking.origin}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 px-8">
                      <div className="relative">
                        <div className="h-px bg-gray-300" />
                        <Icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 bg-white" />
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatTime(booking.arrivalTime)}</p>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{booking.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Status Tracking */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Status Tracking</CardTitle>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refreshStatus}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tripStatus ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${getStatusColor(tripStatus.status)}`}>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tripStatus.status)}
                        <div>
                          <p className="font-semibold capitalize">{tripStatus.status.replace('_', ' ')}</p>
                          {tripStatus.delayMinutes > 0 && (
                            <p className="text-sm mt-1">
                              Delay: {Math.floor(tripStatus.delayMinutes / 60)}h {tripStatus.delayMinutes % 60}m
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {tripStatus.gate && (
                        <div className="text-right">
                          <p className="text-xs font-medium">Gate {tripStatus.gate}</p>
                          {tripStatus.terminal && (
                            <p className="text-xs">Terminal {tripStatus.terminal}</p>
                          )}
                        </div>
                      )}
                      
                      {tripStatus.platform && (
                        <div className="text-right">
                          <p className="text-xs font-medium">Platform {tripStatus.platform}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Scheduled Departure</p>
                        <p className="font-medium text-gray-900">
                          {formatTime(tripStatus.scheduledDeparture)}
                        </p>
                      </div>
                      
                      {tripStatus.actualDeparture && (
                        <div>
                          <p className="text-gray-500 mb-1">Actual Departure</p>
                          <p className="font-medium text-gray-900">
                            {formatTime(tripStatus.actualDeparture)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Data source: {tripStatus.dataSource} • Updated: {new Date(tripStatus.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Awaiting status update...</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={refreshStatus}>
                      Check Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FDC Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  FDC Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fdcVerification ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border ${
                      fdcVerification.verified 
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {fdcVerification.verified ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold mb-1 ${
                            fdcVerification.verified ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {fdcVerification.verified ? 'Verification Successful' : 'Verification Failed'}
                          </p>
                          <p className={`text-sm ${
                            fdcVerification.verified ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {fdcVerification.verified 
                              ? 'Trip status verified by Flare Data Connector'
                              : fdcVerification.errorReason || 'Verification error'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Verification ID</span>
                        <span className="font-mono text-gray-900">{fdcVerification.verificationId}</span>
                      </div>
                      
                      {fdcVerification.attestationHash && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Attestation Hash</span>
                          <span className="font-mono text-xs text-gray-900">
                            {fdcVerification.attestationHash.substring(0, 20)}...
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Data Integrity</span>
                        <span className={`font-medium ${
                          fdcVerification.dataIntegrity === 'valid' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {fdcVerification.dataIntegrity}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-500">Timestamp</span>
                        <span className="text-gray-900">
                          {new Date(fdcVerification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : tripStatus ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">Status data ready for FDC verification</p>
                    <Button onClick={handleVerifyFDC} disabled={verifying}>
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying via FDC...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Verify with FDC
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Verification required before settlement
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Awaiting trip status data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settlement */}
            {fdcVerification?.verified && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    Settlement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settlement ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border ${
                        settlement.executed 
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          {settlement.executed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                          )}
                          <p className={`font-semibold ${
                            settlement.executed ? 'text-green-900' : 'text-blue-900'
                          }`}>
                            {settlement.executed ? 'Settlement Complete' : 'Processing Settlement...'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Policy Applied</span>
                          <span className="font-semibold text-gray-900">
                            {settlement.calculation.appliedPolicy.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-semibold text-gray-900">
                            ${settlement.calculation.totalAmount}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Your Refund ({settlement.calculation.refundPercent}%)</span>
                            <span className="text-2xl font-bold text-green-600">
                              ${settlement.calculation.userRefund}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Provider Receives</span>
                            <span className="font-semibold text-gray-900">
                              ${settlement.calculation.providerPayment}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {settlement.transactionHash && (
                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500 mb-2">Transaction Hash</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-gray-100 p-2 rounded font-mono">
                              {settlement.transactionHash.substring(0, 40)}...
                            </code>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">Ready to execute settlement</p>
                      <Button onClick={handleSettle} disabled={settling}>
                        {settling ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Executing Settlement...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Execute Settlement
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fixed Policy Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compensation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">On time</span>
                    <span className="font-semibold text-gray-900">0%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">3-23h delay</span>
                    <span className="font-semibold text-orange-600">20%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">≥24h delay</span>
                    <span className="font-semibold text-red-600">50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cancellation</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  🔒 Fixed policy - cannot be modified
                </p>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-gray-900">${booking.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency</span>
                  <span className="font-medium text-gray-900">{booking.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Escrow Status</span>
                  <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Funds secured in blockchain escrow until settlement
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
