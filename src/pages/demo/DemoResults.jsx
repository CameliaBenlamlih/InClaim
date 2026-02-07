import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Clock, ArrowRight, RefreshCw, TrendingUp, TrendingDown, Minus, Luggage, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BACKEND_URL } from '../../lib/contract';

export default function DemoResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;
  
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchParams) {
      navigate('/demo');
      return;
    }
    fetchQuotes();
    
    // Auto-refresh every 15 seconds to show price changes
    const interval = setInterval(() => {
      refreshQuotes();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/demo/quotes?` + new URLSearchParams({
          origin: searchParams.origin,
          destination: searchParams.destination,
          date: searchParams.date,
          tripType: searchParams.tripType,
          passengers: searchParams.passengers.toString(),
        })
      );
      
      if (!response.ok) throw new Error('Failed to fetch quotes');
      
      const data = await response.json();
      setQuotes(data.quotes);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuotes = async () => {
    setRefreshing(true);
    await fetchQuotes();
    setRefreshing(false);
  };

  const handleSelectQuote = (quote) => {
    navigate('/demo/checkout', {
      state: {
        quote,
        searchParams,
      }
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDuration = (departure, arrival) => {
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getPriceTrend = (quote) => {
    const diff = quote.currentPrice - quote.basePrice;
    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-4 text-gray-600">Fetching live quotes from providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quotes</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/demo')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {searchParams.tripType === 'flight' ? '✈️' : '🚂'} {searchParams.originName} → {searchParams.destinationName}
              </h1>
              <p className="text-gray-600">
                {new Date(searchParams.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {searchParams.passengers} {searchParams.passengers === 1 ? 'passenger' : 'passengers'}
              </p>
            </div>
            
            <Button
              variant="secondary"
              onClick={refreshQuotes}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Quotes
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="ml-4 text-primary-600 font-medium">
              {quotes.length} quotes available
            </span>
          </div>
        </div>

        {/* Quote List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {quotes.map((quote, index) => {
              const trend = getPriceTrend(quote);
              const Icon = searchParams.tripType === 'flight' ? Plane : Train;
              
              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="group cursor-pointer" onClick={() => handleSelectQuote(quote)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-6">
                        {/* Provider & Times */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{quote.providerName}</h3>
                              <p className="text-sm text-gray-500">{quote.tripId}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatTime(quote.departureTime)}
                              </div>
                              <div className="text-xs text-gray-500">{searchParams.originName}</div>
                            </div>
                            
                            <div className="flex-1 px-4">
                              <div className="relative">
                                <div className="h-px bg-gray-300" />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                  <Icon className="w-4 h-4 text-gray-400" />
                                </div>
                              </div>
                              <div className="text-xs text-center text-gray-500 mt-1">
                                {formatDuration(quote.departureTime, quote.arrivalTime)}
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatTime(quote.arrivalTime)}
                              </div>
                              <div className="text-xs text-gray-500">{searchParams.destinationName}</div>
                            </div>
                          </div>
                        </div>

                        {/* Price & Details */}
                        <div className="text-right">
                          <div className="mb-3">
                            <div className="flex items-center justify-end gap-2 mb-1">
                              <div className="text-3xl font-bold text-gray-900">
                                ${quote.currentPrice}
                              </div>
                              {trend !== 'stable' && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${
                                  trend === 'up' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {Math.abs(quote.currentPrice - quote.basePrice).toFixed(2)}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">per passenger • USDC</div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 justify-end mb-3">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              {quote.fareClass}
                            </span>
                            {quote.baggage && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded flex items-center gap-1">
                                <Luggage className="w-3 h-3" />
                                {quote.baggage}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-2">
                            {quote.seatsAvailable} seats left
                          </div>
                          
                          <Button size="sm" className="group-hover:shadow-lg transition-all">
                            Select
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <p className="text-sm text-primary-900">
            <strong>💡 Live Pricing:</strong> Quotes refresh automatically every 15 seconds. 
            Prices may change based on demand. Complete your purchase quickly to lock in the current price.
          </p>
        </div>
      </div>
    </div>
  );
}
