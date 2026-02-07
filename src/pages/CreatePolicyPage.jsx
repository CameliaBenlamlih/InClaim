import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther, keccak256, toBytes } from 'viem';
import { 
  Plane, 
  Train, 
  Calendar, 
  Clock, 
  Lock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  Info
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Autocomplete from '../components/ui/Autocomplete';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getTxExplorerUrl } from '../lib/contract';
import { dateToTimestamp } from '../lib/utils';
import { COMPENSATION_POLICY, calculateRefund } from '../lib/refund';
import { searchAirports, formatAirport } from '../data/airports';
import { searchStations, formatStation } from '../data/stations';

const tripTypeOptions = [
  { value: '0', label: 'Flight' },
  { value: '1', label: 'Train' },
];

const thresholdOptions = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '60 minutes (Recommended)' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
];

export default function CreatePolicyPage() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();

  const [formData, setFormData] = useState({
    tripType: '0',
    tripId: '',
    travelDate: '',
    ticketPrice: '100',
    from: '',
    to: '',
  });
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [error, setError] = useState('');

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFromSearch = (query) => {
    setFormData(prev => ({ ...prev, from: query }));
    // Use airports for flights, stations for trains
    const suggestions = formData.tripType === '0' 
      ? searchAirports(query) 
      : searchStations(query);
    setFromSuggestions(suggestions);
  };

  const handleToSearch = (query) => {
    setFormData(prev => ({ ...prev, to: query }));
    // Use airports for flights, stations for trains
    const suggestions = formData.tripType === '0' 
      ? searchAirports(query) 
      : searchStations(query);
    setToSuggestions(suggestions);
  };

  const handleFromSelect = (location) => {
    setFromAirport(location);
    const formatted = formData.tripType === '0' 
      ? formatAirport(location) 
      : formatStation(location);
    setFormData(prev => ({ ...prev, from: formatted }));
  };

  const handleToSelect = (location) => {
    setToAirport(location);
    const formatted = formData.tripType === '0' 
      ? formatAirport(location) 
      : formatStation(location);
    setFormData(prev => ({ ...prev, to: formatted }));
  };

  const validateForm = () => {
    if (!fromAirport) {
      setError('Please select a departure location');
      return false;
    }
    if (!toAirport) {
      setError('Please select an arrival location');
      return false;
    }
    if (!formData.tripId.trim()) {
      setError('Please enter a Trip ID');
      return false;
    }
    if (!formData.travelDate) {
      setError('Please select a travel date');
      return false;
    }
    const travelTimestamp = dateToTimestamp(formData.travelDate);
    const now = Math.floor(Date.now() / 1000);
    if (travelTimestamp < now) {
      setError('Travel date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      open();
      return;
    }

    if (!validateForm()) return;

    try {
      const travelTimestamp = BigInt(dateToTimestamp(formData.travelDate));
      // Deadline is 7 days after travel date
      const deadline = travelTimestamp + BigInt(7 * 24 * 60 * 60);
      const ticketPriceWei = parseEther(formData.ticketPrice);
      // Max payout is 100% of ticket price (for cancellation)
      const maxPayoutWei = ticketPriceWei;
      // Threshold is now fixed at 180 minutes (3 hours) for 20% refund
      const thresholdMinutes = 180;

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createPolicy',
        args: [
          parseInt(formData.tripType),
          formData.tripId,
          travelTimestamp,
          thresholdMinutes,
          maxPayoutWei,
          deadline,
        ],
        value: ticketPriceWei, // Full ticket price locked in escrow
      });
    } catch (err) {
      console.error('Error creating policy:', err);
      setError(err.message || 'Failed to create policy');
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 mb-2 uppercase tracking-wider">
              Policy Created!
            </h2>
            <p className="text-dark-500 text-sm mb-6">
              Your travel delay insurance policy has been created successfully.
            </p>
            
            <div className="bg-dark-100 p-4 mb-6">
              <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Transaction Hash</p>
              <a
                href={getTxExplorerUrl(hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-700 hover:text-dark-900 font-mono text-xs break-all"
              >
                {hash}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/policies')}
              >
                View My Policies
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setFormData({
                    tripType: '0',
                    tripId: '',
                    travelDate: '',
                    ticketPrice: '100',
                    from: '',
                    to: '',
                  });
                  setFromAirport(null);
                  setToAirport(null);
                  window.location.reload();
                }}
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-dark-900 mb-2 uppercase tracking-wider">
            Create Escrow Policy
          </h1>
          <p className="text-dark-500 text-sm">
            Lock your ticket payment. Get instant refunds if delays happen.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trip Type */}
              <div>
                <label className="label">Trip Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '0', label: 'Flight', icon: Plane },
                    { value: '1', label: 'Train', icon: Train },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tripType: type.value }))}
                      className={`flex items-center justify-center gap-3 p-4 border transition-all text-xs font-bold uppercase tracking-wider ${
                        formData.tripType === type.value
                          ? 'border-dark-900 text-dark-900'
                          : 'border-dark-200 hover:border-dark-400 text-dark-500'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* From Location */}
              <Autocomplete
                label="From"
                value={formData.from}
                onChange={handleFromSearch}
                onSelect={handleFromSelect}
                options={fromSuggestions}
                placeholder="Start typing: London, Paris, New York..."
                formatOption={formatAirport}
                renderOption={(airport) => (
                  <div>
                    <div className="font-bold text-dark-900">{airport.city} ({airport.code})</div>
                    <div className="text-xs text-dark-500">{airport.name}</div>
                  </div>
                )}
              />

              {/* To Location */}
              <Autocomplete
                label="To"
                value={formData.to}
                onChange={handleToSearch}
                onSelect={handleToSelect}
                options={toSuggestions}
                placeholder="Start typing: London, Paris, New York..."
                formatOption={formatAirport}
                renderOption={(airport) => (
                  <div>
                    <div className="font-bold text-dark-900">{airport.city} ({airport.code})</div>
                    <div className="text-xs text-dark-500">{airport.name}</div>
                  </div>
                )}
              />

              {/* Trip ID */}
              <Input
                label="Trip ID (Flight Number / Train ID)"
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                placeholder="e.g., BA123 or IC502"
              />

              {/* Travel Date */}
              <Input
                label="Travel Date"
                name="travelDate"
                type="date"
                value={formData.travelDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />

              {/* Ticket Price */}
              <div>
                <Input
                  label="Ticket Price You Paid (C2FLR)"
                  name="ticketPrice"
                  type="number"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  step="0.01"
                />
                <p className="text-[10px] text-dark-400 mt-1 flex items-start gap-1 font-mono">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Enter the amount you already paid to the airline/train company. This amount will be locked in escrow and refunded based on delays.</span>
                </p>
              </div>

              {/* Fixed Compensation Policy (Read-only) */}
              <div>
                <label className="label flex items-center gap-2">
                  Compensation Policy (Fixed)
                  <Info className="w-3 h-3 text-dark-400" />
                </label>
                <div className="space-y-0 divide-y divide-dotted divide-dark-200">
                  {COMPENSATION_POLICY.map((policy, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-2"
                    >
                      <span className="text-xs text-dark-500">{policy.label}</span>
                      <span className={`text-xs font-mono font-bold ${
                        policy.refundPercent === 0 ? 'text-dark-500' :
                        policy.refundPercent === 20 ? 'text-yellow-400' :
                        policy.refundPercent === 50 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {policy.refundPercent}% refund
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Refund Examples */}
              <div className="border border-dark-200 p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-dark-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">
                      Your {formData.ticketPrice} C2FLR will be locked in escrow
                    </p>
                    <p className="text-[10px] text-dark-500 mb-2 font-mono">
                      You've already paid the airline/train company. This creates a protection policy on the blockchain.
                    </p>
                    <div className="space-y-1 text-[10px] text-dark-500 font-mono">
                      <p>On time: No refund (money stays with carrier)</p>
                      <p>3-23h delay: {calculateRefund(formData.ticketPrice, 180).refundAmount} C2FLR refund (20%)</p>
                      <p>24h+ delay: {calculateRefund(formData.ticketPrice, 1440).refundAmount} C2FLR refund (50%)</p>
                      <p>Cancelled: {calculateRefund(formData.ticketPrice, 0, true).refundAmount} C2FLR full refund (100%)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {(error || writeError) && (
                <div className="flex items-center gap-2 p-4 border border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs font-mono">{error || writeError?.message}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isPending || isConfirming}
                disabled={isPending || isConfirming}
              >
                {!isConnected ? (
                  'Connect Wallet'
                ) : isPending ? (
                  'Confirm in Wallet...'
                ) : isConfirming ? (
                  'Creating Policy...'
                ) : (
                  <>
                    Create Policy
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 border border-dark-200">
          <h3 className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">Escrow System</h3>
          <ul className="text-xs text-dark-500 space-y-1 font-mono">
            <li>1. Your ticket payment is locked on Flare blockchain</li>
            <li>2. After travel date, submit a claim to verify delay status</li>
            <li>3. Instant refund based on fixed compensation policy</li>
            <li>4. Claim deadline: 7 days after travel date</li>
          </ul>
          <a href="/how-it-works" className="text-xs font-bold text-dark-700 hover:text-dark-900 mt-2 inline-block uppercase tracking-wider">
            Learn more →
          </a>
        </div>
      </motion.div>
    </div>
  );
}
