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
    <div>
      {/* Hero Section */}
      <section className="pt-12 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-dark-200 text-dark-500 text-xs font-bold uppercase tracking-widest font-mono mb-8">
              <Zap className="w-3 h-3" />
              Demo: Live Quote Purchase Flow
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-dark-900 leading-none mb-6 uppercase tracking-tight">
              File in a flash,<br/>
              <span className="text-dark-500">get your cash</span>
            </h1>
            
            <p className="text-base text-dark-500 mb-6 max-w-2xl mx-auto">
              Buy your ticket directly in InClaim. Get live quotes from providers.
              Automatic refunds powered by blockchain escrow + Flare FDC.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-xs text-dark-500 uppercase tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-dark-700" />
                <span>FDC Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-dark-700" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-dark-700" />
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
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Trip Type Selector - mode switch style */}
                  <div className="flex border-b border-dark-200">
                    <button
                      type="button"
                      onClick={() => {
                        setTripType('flight');
                        setSearchParams(prev => ({ ...prev, from: '', to: '' }));
                        setFromLocation(null);
                        setToLocation(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        tripType === 'flight'
                          ? 'text-dark-900'
                          : 'text-dark-500 hover:text-dark-700'
                      }`}
                    >
                      <Plane className="w-4 h-4" />
                      <span>Flights</span>
                      {tripType === 'flight' && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-dark-900" />
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setTripType('train');
                        setSearchParams(prev => ({ ...prev, from: '', to: '' }));
                        setFromLocation(null);
                        setToLocation(null);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        tripType === 'train'
                          ? 'text-dark-900'
                          : 'text-dark-500 hover:text-dark-700'
                      }`}
                    >
                      <Train className="w-4 h-4" />
                      <span>Trains</span>
                      {tripType === 'train' && (
                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-dark-900" />
                      )}
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
                          <div className="font-bold text-dark-900">
                            {loc.city} {tripType === 'flight' && `(${loc.code})`}
                          </div>
                          <div className="text-xs text-dark-500">{loc.name}</div>
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
                          <div className="font-bold text-dark-900">
                            {loc.city} {tripType === 'flight' && `(${loc.code})`}
                          </div>
                          <div className="text-xs text-dark-500">{loc.name}</div>
                        </div>
                      )}
                      icon={MapPin}
                    />
                  </div>

                  {/* Date and Passengers */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={searchParams.date}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">
                        Passengers
                      </label>
                      <select
                        value={searchParams.passengers}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                        className="input-field appearance-none"
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
                    <Search className="w-4 h-4" />
                    Search Live Quotes
                    <ArrowRight className="w-4 h-4" />
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
            className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-mono uppercase tracking-wider"
          >
            <div className="px-4 py-2 border border-dark-200 text-dark-500">
              Live provider quotes
            </div>
            <div className="px-4 py-2 border border-dark-200 text-dark-500">
              Blockchain escrow
            </div>
            <div className="px-4 py-2 border border-dark-200 text-dark-500">
              Instant booking
            </div>
            <div className="px-4 py-2 border border-dark-200 text-dark-500">
              FDC verified refunds
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
