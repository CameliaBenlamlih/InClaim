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
        <p className="ml-4 text-dark-500 font-mono text-xs uppercase tracking-wider">Fetching live quotes from providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">Error Loading Quotes</h2>
            <p className="text-dark-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/demo')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - route display style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-dark-900 uppercase tracking-tight mb-1">
                {searchParams.originName}
              </h1>
              <h1 className="text-3xl font-bold text-dark-500 uppercase tracking-tight">
                {searchParams.destinationName}
              </h1>
              <div className="flex gap-4 mt-2 text-xs text-dark-500 uppercase font-mono tracking-wider">
                <span>{searchParams.tripType === 'flight' ? 'Flight' : 'Train'}</span>
                <span>{searchParams.passengers} {searchParams.passengers === 1 ? 'Adult' : 'Adults'}</span>
                <span>{new Date(searchParams.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            
            <Button
              variant="secondary"
              onClick={refreshQuotes}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-3 text-xs text-dark-500 font-mono border-t border-dashed border-dark-200 pt-3">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="text-dark-700 font-bold">
              {quotes.length} quotes
            </span>
          </div>
        </div>

        {/* Quote List - result-card style */}
        <div className="divide-y divide-dotted divide-dark-200">
          <AnimatePresence mode="popLayout">
            {quotes.map((quote, index) => {
              const trend = getPriceTrend(quote);
              
              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="py-5 cursor-pointer hover:bg-dark-50/50 transition-colors"
                  onClick={() => handleSelectQuote(quote)}
                >
                  {/* Time grid - matching design result-card */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-x-6 gap-y-2 items-center">
                    {/* Departure */}
                    <div>
                      <span className="text-xl font-mono text-dark-900">
                        {formatTime(quote.departureTime)}
                      </span>
                      <div className="mt-1">
                        <span className="text-[10px] font-mono font-bold uppercase bg-dark-900 text-dark px-1 py-[1px] inline-block">
                          {searchParams.origin}
                        </span>
                      </div>
                    </div>
                    
                    {/* Duration viz */}
                    <div className="flex flex-col items-center w-20">
                      <span className="text-[10px] font-mono text-dark-500 mb-1">
                        {formatDuration(quote.departureTime, quote.arrivalTime).toUpperCase()}
                      </span>
                      <div className="w-full border-b-2 border-dotted border-dark-500 relative">
                        <div className="absolute top-[-2px] left-1/2 w-1 h-1 bg-dark-900" />
                      </div>
                      <span className="text-[9px] font-mono text-dark-500 mt-1 uppercase">
                        Direct
                      </span>
                    </div>
                    
                    {/* Arrival */}
                    <div className="text-right">
                      <span className="text-xl font-mono text-dark-900">
                        {formatTime(quote.arrivalTime)}
                      </span>
                      <div className="mt-1">
                        <span className="text-[10px] font-mono font-bold uppercase bg-dark-900 text-dark px-1 py-[1px] inline-block">
                          {searchParams.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Carrier info row */}
                  <div className="flex justify-between items-center mt-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-dark-500 uppercase">
                      <div className="w-2 h-2 border border-dark-500" style={{
                        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                        backgroundSize: '2px 2px'
                      }} />
                      {quote.providerName}
                      {quote.fareClass && (
                        <span className="text-dark-400 ml-2">{quote.fareClass}</span>
                      )}
                      {quote.seatsAvailable && (
                        <span className="text-dark-400">{quote.seatsAvailable} left</span>
                      )}
                    </div>
                    <div className="font-mono text-sm font-bold text-dark-900">
                      ${quote.currentPrice}
                      {trend !== 'stable' && (
                        <span className={`ml-2 text-[10px] ${
                          trend === 'up' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {trend === 'up' ? '+' : '-'}{Math.abs(quote.currentPrice - quote.basePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-4 border border-dark-200">
          <p className="text-xs text-dark-500 font-mono">
            <span className="text-dark-700 font-bold">LIVE PRICING:</span> Quotes refresh automatically every 15 seconds. 
            Prices may change based on demand. Complete your purchase quickly to lock in the current price.
          </p>
        </div>
      </div>
    </div>
  );
}
