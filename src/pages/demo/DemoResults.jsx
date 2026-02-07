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
      navigate('/book');
      return;
    }
    fetchQuotes();
    
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
    navigate('/book/checkout', {
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
        <p className="ml-4 text-dark-500 text-xs">Fetching live quotes from providers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="font-serif text-xl text-dark-900 mb-2">Error Loading Quotes</h2>
            <p className="text-dark-500 text-sm mb-4">{error}</p>
            <Button onClick={() => navigate('/book')}>Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto">
        {}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-3xl text-dark-900 mb-1">
                {searchParams.originName}
              </h1>
              <h1 className="font-serif text-3xl text-dark-400">
                {searchParams.destinationName}
              </h1>
              <div className="flex gap-4 mt-2 text-xs text-dark-500">
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

          <div className="flex items-center gap-3 text-xs text-dark-500 border-t border-dark-200 pt-3">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            <span className="text-dark-900 font-semibold">
              {quotes.length} quotes
            </span>
          </div>
        </div>

        {}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {quotes.map((quote, index) => {
              const airlineColors = {
                'EMIRATES': { bg: 'bg-red-50', border: 'border-red-200', accent: 'text-red-600', dot: 'bg-red-500' },
                'BRITISH AIRWAYS': { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-600', dot: 'bg-blue-500' },
                'AIR FRANCE': { bg: 'bg-sky-50', border: 'border-sky-200', accent: 'text-sky-600', dot: 'bg-sky-500' },
                'LUFTHANSA': { bg: 'bg-yellow-50', border: 'border-yellow-200', accent: 'text-yellow-700', dot: 'bg-yellow-500' },
                'EUROSTAR': { bg: 'bg-indigo-50', border: 'border-indigo-200', accent: 'text-indigo-600', dot: 'bg-indigo-500' },
                'THALYS': { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'text-purple-600', dot: 'bg-purple-500' },
                'SNCF': { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-600', dot: 'bg-teal-500' },
              };
              const colors = airlineColors[quote.providerName?.toUpperCase()] || { bg: 'bg-dark-50', border: 'border-dark-200', accent: 'text-dark-600', dot: 'bg-dark-500' };

              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-5 cursor-pointer rounded-card border bg-white transition-all hover:shadow-[0_4px_24px_rgba(255,59,0,0.12)] hover:-translate-y-0.5 ${colors.border}`}
                  onClick={() => handleSelectQuote(quote)}
                >
                  {}
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${colors.dot}`} />

                  {}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-x-6 gap-y-2 items-center pl-4">
                    {}
                    <div>
                      <span className="font-serif text-3xl text-dark-900">
                        {formatTime(quote.departureTime)}
                      </span>
                      <div className="mt-1">
                        <span className="text-xs font-medium uppercase text-dark-500">
                          {searchParams.origin}
                        </span>
                      </div>
                    </div>
                    
                    {}
                    <div className="flex flex-col items-center w-24">
                      <span className="text-xs font-medium text-dark-500 mb-1">
                        {formatDuration(quote.departureTime, quote.arrivalTime)}
                      </span>
                      <div className="w-full relative flex items-center">
                        <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
                        <div className="flex-1 border-b-2 border-dashed border-dark-300 mx-1" />
                        <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0`} />
                      </div>
                      <span className="text-[10px] text-dark-400 mt-1">
                        Direct
                      </span>
                    </div>
                    
                    {}
                    <div className="text-right">
                      <span className="font-serif text-3xl text-dark-900">
                        {formatTime(quote.arrivalTime)}
                      </span>
                      <div className="mt-1">
                        <span className="text-xs font-medium uppercase text-dark-500">
                          {searchParams.destination}
                        </span>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-dark-100 pl-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                      <span className={`text-xs font-semibold uppercase ${colors.accent}`}>{quote.providerName}</span>
                      {quote.fareClass && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-pill font-medium ${colors.bg} ${colors.accent}`}>{quote.fareClass}</span>
                      )}
                      {quote.seatsAvailable && (
                        <span className="text-[10px] text-dark-400">{quote.seatsAvailable} left</span>
                      )}
                    </div>
                    <div className="font-serif text-2xl text-dark-900">
                      ${quote.currentPrice}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {}
        <div className="mt-8 p-4 bg-surface rounded-sm border border-dark-200/50">
          <p className="text-xs text-dark-500">
            <span className="text-dark-900 font-semibold">Live Pricing:</span> Quotes refresh automatically every 15 seconds. 
            Prices may change based on demand. Complete your purchase quickly to lock in the current price.
          </p>
        </div>
      </div>
    </div>
  );
}
