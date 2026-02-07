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
      case 'on_time': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'delayed': return <Clock className="w-4 h-4 text-orange-400" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-dark-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'delayed': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-dark-100 text-dark-500 border-dark-200';
    }
  };

  const formatTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { 
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
        <p className="ml-4 text-dark-500 font-mono text-xs uppercase tracking-wider">Loading trip details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">Booking Not Found</h2>
            <p className="text-dark-500 text-sm mb-4">{error || 'This booking could not be found'}</p>
            <Button onClick={() => navigate('/book')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = booking.tripType === 'flight' ? Plane : Train;

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-900 uppercase tracking-tight mb-1">
                {booking.origin} — {booking.destination}
              </h1>
              <p className="text-xs text-dark-500 font-mono uppercase tracking-wider">
                Booking: {booking.bookingId}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Status</div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 border text-xs font-bold uppercase tracking-wider font-mono ${
                booking.status === 'confirmed' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                  : 'bg-dark-100 text-dark-500 border-dark-200'
              }`}>
                {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                <span>{booking.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Provider</p>
                    <p className="font-bold text-dark-900 text-sm">{booking.providerName}</p>
                    <p className="text-xs text-dark-500 font-mono">{booking.tripId}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Passenger</p>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-dark-400" />
                      <p className="text-sm text-dark-900">{booking.passengerName}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-3 h-3 text-dark-400" />
                      <p className="text-xs text-dark-500 font-mono">{booking.passengerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dotted border-dark-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-3 h-3 text-dark-400" />
                    <p className="text-xs text-dark-500 font-mono">{formatDate(booking.departureTime)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-mono font-bold text-dark-900">{formatTime(booking.departureTime)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] font-mono font-bold uppercase bg-dark-900 text-dark px-1 py-[1px]">
                          {booking.origin}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 px-8">
                      <div className="border-b-2 border-dotted border-dark-300" />
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-mono font-bold text-dark-900">{formatTime(booking.arrivalTime)}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-[10px] font-mono font-bold uppercase bg-dark-900 text-dark px-1 py-[1px]">
                          {booking.destination}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Status Tracking</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshStatus}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tripStatus ? (
                  <div className="space-y-4">
                    <div className={`p-4 border flex items-center justify-between ${getStatusColor(tripStatus.status)}`}>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tripStatus.status)}
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wider">{tripStatus.status.replace('_', ' ')}</p>
                          {tripStatus.delayMinutes > 0 && (
                            <p className="text-xs font-mono mt-1">
                              Delay: {Math.floor(tripStatus.delayMinutes / 60)}h {tripStatus.delayMinutes % 60}m
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {tripStatus.gate && (
                        <div className="text-right">
                          <p className="text-[10px] font-mono font-bold uppercase">Gate {tripStatus.gate}</p>
                          {tripStatus.terminal && (
                            <p className="text-[10px] font-mono text-dark-500">Terminal {tripStatus.terminal}</p>
                          )}
                        </div>
                      )}
                      
                      {tripStatus.platform && (
                        <div className="text-right">
                          <p className="text-[10px] font-mono font-bold uppercase">Platform {tripStatus.platform}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Scheduled</p>
                        <p className="font-mono text-dark-900">
                          {formatTime(tripStatus.scheduledDeparture)}
                        </p>
                      </div>
                      
                      {tripStatus.actualDeparture && (
                        <div>
                          <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Actual</p>
                          <p className="font-mono text-dark-900">
                            {formatTime(tripStatus.actualDeparture)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-dark-400 font-mono uppercase tracking-wider">
                      Source: {tripStatus.dataSource} | {new Date(tripStatus.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-8 h-8 text-dark-300 mx-auto mb-3" />
                    <p className="text-dark-500 text-sm">Awaiting status update...</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={refreshStatus}>
                      Check Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-dark-700" />
                  FDC Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fdcVerification ? (
                  <div className="space-y-4">
                    <div className={`p-4 border ${
                      fdcVerification.verified 
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        {fdcVerification.verified ? (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-bold text-xs uppercase tracking-wider mb-1 ${
                            fdcVerification.verified ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {fdcVerification.verified ? 'Verification Successful' : 'Verification Failed'}
                          </p>
                          <p className={`text-xs ${
                            fdcVerification.verified ? 'text-green-400/70' : 'text-red-400/70'
                          }`}>
                            {fdcVerification.verified 
                              ? 'Trip status verified by Flare Data Connector'
                              : fdcVerification.errorReason || 'Verification error'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-dark-500 uppercase tracking-wider">Verification ID</span>
                        <span className="font-mono text-dark-900">{fdcVerification.verificationId}</span>
                      </div>
                      
                      {fdcVerification.attestationHash && (
                        <div className="flex justify-between">
                          <span className="text-dark-500 uppercase tracking-wider">Attestation Hash</span>
                          <span className="font-mono text-dark-700">
                            {fdcVerification.attestationHash.substring(0, 20)}...
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-dark-500 uppercase tracking-wider">Data Integrity</span>
                        <span className={`font-mono font-bold ${
                          fdcVerification.dataIntegrity === 'valid' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {fdcVerification.dataIntegrity}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-dark-500 uppercase tracking-wider">Timestamp</span>
                        <span className="font-mono text-dark-700">
                          {new Date(fdcVerification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : tripStatus ? (
                  <div className="text-center py-8">
                    <Shield className="w-8 h-8 text-dark-300 mx-auto mb-3" />
                    <p className="text-dark-500 text-sm mb-4">Status data ready for FDC verification</p>
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
                    <p className="text-[10px] text-dark-400 mt-2 uppercase tracking-widest font-mono">
                      Verification required before settlement
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-dark-500 text-sm">Awaiting trip status data...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            {fdcVerification?.verified && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-dark-700" />
                    Settlement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {settlement ? (
                    <div className="space-y-4">
                      <div className={`p-4 border ${
                        settlement.executed 
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          {settlement.executed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                          )}
                          <p className={`font-bold text-xs uppercase tracking-wider ${
                            settlement.executed ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {settlement.executed ? 'Settlement Complete' : 'Processing Settlement...'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-dark-100 p-4 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-dark-500 uppercase tracking-wider">Policy Applied</span>
                          <span className="font-bold text-dark-900 font-mono">
                            {settlement.calculation.appliedPolicy.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-dark-500 uppercase tracking-wider">Total Amount</span>
                          <span className="font-bold text-dark-900 font-mono">
                            ${settlement.calculation.totalAmount}
                          </span>
                        </div>
                        
                        <div className="border-t border-dark-200 pt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-dark-500 uppercase tracking-wider">Your Refund ({settlement.calculation.refundPercent}%)</span>
                            <span className="text-xl font-mono font-bold text-green-400">
                              ${settlement.calculation.userRefund}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-dark-500 uppercase tracking-wider">Provider Receives</span>
                            <span className="font-bold text-dark-700 font-mono">
                              ${settlement.calculation.providerPayment}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {settlement.transactionHash && (
                        <div className="pt-4 border-t border-dark-200">
                          <p className="text-[10px] text-dark-500 mb-2 uppercase tracking-widest">Transaction Hash</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-[10px] bg-dark-100 p-2 font-mono text-dark-700">
                              {settlement.transactionHash.substring(0, 40)}...
                            </code>
                            <ExternalLink className="w-3 h-3 text-dark-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lock className="w-8 h-8 text-dark-300 mx-auto mb-3" />
                      <p className="text-dark-500 text-sm mb-4">Ready to execute settlement</p>
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
              <div className="p-4 border border-red-500/30 bg-red-500/10 flex items-start gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-mono">{error}</p>
              </div>
            )}
          </div>

          {}
          <div className="space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Compensation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-3 border-b border-dotted border-dark-200">
                    <span className="text-dark-500 uppercase tracking-wider">On time</span>
                    <span className="font-mono font-bold text-dark-500">0%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dotted border-dark-200">
                    <span className="text-dark-500 uppercase tracking-wider">3-23h delay</span>
                    <span className="font-mono font-bold text-orange-400">20%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-dotted border-dark-200">
                    <span className="text-dark-500 uppercase tracking-wider">24h+ delay</span>
                    <span className="font-mono font-bold text-red-400">50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-dark-500 uppercase tracking-wider">Cancellation</span>
                    <span className="font-mono font-bold text-green-400">100%</span>
                  </div>
                </div>
                <p className="text-[10px] text-dark-400 mt-4 uppercase tracking-widest font-mono">
                  Fixed policy — cannot be modified
                </p>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-dark-500 uppercase tracking-wider">Amount Paid</span>
                  <span className="font-mono font-bold text-dark-900">${booking.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500 uppercase tracking-wider">Currency</span>
                  <span className="font-mono text-dark-900">{booking.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500 uppercase tracking-wider">Escrow Status</span>
                  <span className="inline-flex items-center gap-1 text-green-400 font-mono font-bold">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                </div>
                <div className="pt-3 border-t border-dark-200">
                  <p className="text-[10px] text-dark-400 font-mono uppercase tracking-wider">
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
