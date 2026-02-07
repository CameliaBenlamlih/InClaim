import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plane, Train, MapPin, Calendar, Users, ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Autocomplete from '../../components/ui/Autocomplete';
import { searchAirports, formatAirport } from '../../data/airports';
import { searchStations, formatStation } from '../../data/stations';

export default function DemoLanding() {
  const navigate = useNavigate();
  
  const [tripType, setTripType] = useState('flight');
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });
  
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const handleFromSearch = (query) => {
    setSearchParams(prev => ({ ...prev, from: query }));
    const suggestions = tripType === 'flight' 
      ? searchAirports(query) 
      : searchStations(query);
    setFromSuggestions(suggestions);
  };

  const handleToSearch = (query) => {
    setSearchParams(prev => ({ ...prev, to: query }));
    const suggestions = tripType === 'flight' 
      ? searchAirports(query) 
      : searchStations(query);
    setToSuggestions(suggestions);
  };

  const handleFromSelect = (location) => {
    setFromLocation(location);
    const formatted = tripType === 'flight' 
      ? formatAirport(location) 
      : formatStation(location);
    setSearchParams(prev => ({ ...prev, from: formatted }));
  };

  const handleToSelect = (location) => {
    setToLocation(location);
    const formatted = tripType === 'flight' 
      ? formatAirport(location) 
      : formatStation(location);
    setSearchParams(prev => ({ ...prev, to: formatted }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!fromLocation || !toLocation || !searchParams.date) {
      alert('Please fill all fields');
      return;
    }

    // Navigate to results with search params
    navigate('/demo/results', {
      state: {
        tripType,
        origin: fromLocation.code || fromLocation.city,
        originName: fromLocation.city,
        destination: toLocation.code || toLocation.city,
        destinationName: toLocation.city,
        date: searchParams.date,
        passengers: searchParams.passengers,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Demo: Live Quote Purchase Flow
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-gray-900 leading-tight mb-6">
              <span className="text-primary-600">File in a flash,</span><br/>
              get your cash
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              Buy your ticket directly in InClaim. Get live quotes from providers.
              Automatic refunds powered by blockchain escrow + Flare FDC.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-600" />
                <span>FDC Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary-600" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-600" />
                <span>Fixed Policies</span>
              </div>
            </div>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="max-w-4xl mx-auto shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Trip Type Selector */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setTripType('flight');
                        setSearchParams(prev => ({ ...prev, from: '', to: '' }));
                        setFromLocation(null);
                        setToLocation(null);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        tripType === 'flight'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Plane className="w-5 h-5" />
                      <span>Flight</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setTripType('train');
                        setSearchParams(prev => ({ ...prev, from: '', to: '' }));
                        setFromLocation(null);
                        setToLocation(null);
                      }}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        tripType === 'train'
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Train className="w-5 h-5" />
                      <span>Train</span>
                    </button>
                  </div>

                  {/* From/To Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Autocomplete
                      label={tripType === 'flight' ? 'From Airport' : 'From Station'}
                      value={searchParams.from}
                      onChange={handleFromSearch}
                      onSelect={handleFromSelect}
                      options={fromSuggestions}
                      placeholder={tripType === 'flight' 
                        ? 'London, Paris, New York...'
                        : "King's Cross, Gare du Nord..."}
                      formatOption={tripType === 'flight' ? formatAirport : formatStation}
                      renderOption={(loc) => (
                        <div>
                          <div className="font-semibold">
                            {loc.city} {tripType === 'flight' && `(${loc.code})`}
                          </div>
                          <div className="text-sm text-gray-500">{loc.name}</div>
                        </div>
                      )}
                      icon={MapPin}
                    />

                    <Autocomplete
                      label={tripType === 'flight' ? 'To Airport' : 'To Station'}
                      value={searchParams.to}
                      onChange={handleToSearch}
                      onSelect={handleToSelect}
                      options={toSuggestions}
                      placeholder={tripType === 'flight' 
                        ? 'London, Paris, New York...'
                        : "King's Cross, Gare du Nord..."}
                      formatOption={tripType === 'flight' ? formatAirport : formatStation}
                      renderOption={(loc) => (
                        <div>
                          <div className="font-semibold">
                            {loc.city} {tripType === 'flight' && `(${loc.code})`}
                          </div>
                          <div className="text-sm text-gray-500">{loc.name}</div>
                        </div>
                      )}
                      icon={MapPin}
                    />
                  </div>

                  {/* Date and Passengers */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={searchParams.date}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-2" />
                        Passengers
                      </label>
                      <select
                        value={searchParams.passengers}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                  >
                    <Search className="w-5 h-5" />
                    Search Live Quotes
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-sm"
          >
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700">
              ✨ Live provider quotes
            </div>
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700">
              🔒 Blockchain escrow
            </div>
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700">
              ⚡ Instant booking
            </div>
            <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-gray-700">
              🛡️ FDC verified refunds
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
