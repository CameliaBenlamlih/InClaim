import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useReadContract } from 'wagmi';
import { 
  Plane, 
  Train, 
  Calendar, 
  Clock, 
  Coins,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
  FileSearch,
  Send,
  PartyPopper
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  BACKEND_URL,
  getTxExplorerUrl,
  getAddressExplorerUrl
} from '../lib/contract';
import { 
  formatDate, 
  formatC2FLR, 
  getTripTypeLabel,
} from '../lib/utils';
import { calculateRefund, getRefundPercent } from '../lib/refund';

const claimSteps = [
  { id: 'request', label: 'Requesting Attestation', icon: FileSearch },
  { id: 'attestation', label: 'Attestation Received', icon: Shield },
  { id: 'submit', label: 'Submitting Proof', icon: Send },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle },
];

export default function ClaimPage() {
  const { policyId } = useParams();
  const { isConnected, address } = useAccount();
  
  const [claimStatus, setClaimStatus] = useState('idle'); // idle, loading, success, error
  const [currentStep, setCurrentStep] = useState(0);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch policy data
  const { data: policy, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPolicy',
    args: [BigInt(policyId || 0)],
    enabled: !!policyId,
  });

  const policyData = policy ? {
    id: policyId,
    owner: policy.owner,
    tripType: Number(policy.tripType),
    tripIdHash: policy.tripIdHash,
    travelDate: Number(policy.travelDate),
    thresholdMinutes: Number(policy.thresholdMinutes),
    payoutAmount: policy.payoutAmount,
    deadline: Number(policy.deadline),
    status: Number(policy.status),
    createdAt: Number(policy.createdAt),
  } : null;

  const Icon = policyData?.tripType === 0 ? Plane : Train;
  const canClaim = policyData?.status === 0 && Date.now() / 1000 > policyData?.travelDate;
  const isExpired = policyData?.status === 0 && Date.now() / 1000 > policyData?.deadline;

  const handleClaim = async () => {
    if (!policyId || !isConnected) return;

    setClaimStatus('loading');
    setCurrentStep(0);
    setError('');

    try {
      // Step 1: Request attestation
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Attestation received
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Submit proof
      setCurrentStep(2);
      
      const response = await fetch(`${BACKEND_URL}/api/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Claim failed');
      }

      // Step 4: Resolved
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      setClaimResult(result);
      setClaimStatus('success');
      refetch();
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to process claim');
      setClaimStatus('error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-dark-500 mx-auto mb-4" />
            <p className="text-dark-500 text-xs font-mono uppercase tracking-wider">Loading policy...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!policyData) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
              Policy Not Found
            </h2>
            <p className="text-dark-500 text-sm mb-6">
              The requested policy does not exist.
            </p>
            <Link to="/policies">
              <Button variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                Back to Policies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Link */}
        <Link
          to="/policies"
          className="inline-flex items-center gap-2 text-dark-500 hover:text-dark-900 mb-6 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Policies
        </Link>

        {/* Policy Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-dark-200 flex items-center justify-center">
                <Icon className="w-5 h-5 text-dark-900" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-xl font-bold text-dark-900 uppercase tracking-wider">
                    Policy #{policyData.id}
                  </h1>
                  <StatusBadge status={isExpired ? 3 : policyData.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-dark-400 uppercase tracking-widest text-[10px]">Type</span>
                    <p className="font-mono text-dark-900 mt-0.5">
                      {getTripTypeLabel(policyData.tripType)}
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-widest text-[10px]">Travel Date</span>
                    <p className="font-mono text-dark-900 mt-0.5">
                      {formatDate(policyData.travelDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-widest text-[10px]">Threshold</span>
                    <p className="font-mono text-dark-900 mt-0.5">
                      {policyData.thresholdMinutes} min
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-widest text-[10px]">Ticket Price</span>
                    <p className="font-mono text-dark-900 mt-0.5">
                      {formatC2FLR(policyData.payoutAmount)} C2FLR
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dotted border-dark-200 flex items-center gap-2 text-[10px] text-dark-400 font-mono uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Deadline: {formatDate(policyData.deadline)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claim Section */}
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {claimStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {policyData.status === 1 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                        Claim Approved!
                      </h2>
                      <p className="text-dark-500 text-sm">
                        This policy has been successfully claimed and paid out.
                      </p>
                    </div>
                  ) : policyData.status === 2 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                        Claim Rejected
                      </h2>
                      <p className="text-dark-500 text-sm">
                        The trip was not delayed beyond the threshold. No payout.
                      </p>
                    </div>
                  ) : isExpired ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 border border-dark-200 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-5 h-5 text-dark-400" />
                      </div>
                      <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                        Policy Expired
                      </h2>
                      <p className="text-dark-500 text-sm">
                        The claim deadline has passed for this policy.
                      </p>
                    </div>
                  ) : !canClaim ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                        Not Yet Claimable
                      </h2>
                      <p className="text-dark-500 text-sm">
                        You can claim after your travel date: {formatDate(policyData.travelDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 border border-dark-900 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-5 h-5 text-dark-900" />
                      </div>
                      <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                        Ready to Verify
                      </h2>
                      <p className="text-dark-500 text-sm mb-4">
                        Click below to verify your trip status using real flight data.
                      </p>
                      <div className="bg-dark-100 p-4 mb-6 text-left">
                        <p className="text-xs font-bold text-dark-900 mb-2 uppercase tracking-wider">Potential Refunds:</p>
                        <div className="space-y-1 text-[10px] text-dark-500 font-mono">
                          <p>3-23h delay: <span className="font-bold text-yellow-400">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 180).refundAmount)} C2FLR</span> (20%)</p>
                          <p>24h+ delay: <span className="font-bold text-orange-400">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 1440).refundAmount)} C2FLR</span> (50%)</p>
                          <p>Cancelled: <span className="font-bold text-red-400">{formatC2FLR(policyData.payoutAmount)} C2FLR</span> (100%)</p>
                        </div>
                      </div>
                      <Button size="lg" onClick={handleClaim}>
                        <Shield className="w-4 h-4" />
                        Verify with FDC
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {claimStatus === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8"
                >
                  <h2 className="text-sm font-bold text-dark-900 text-center mb-8 uppercase tracking-wider">
                    Verifying Trip Status...
                  </h2>

                  <div className="space-y-3">
                    {claimSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index === currentStep;
                      const isComplete = index < currentStep;

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-4 p-4 border transition-colors ${
                            isActive
                              ? 'border-dark-900 bg-dark-50'
                              : isComplete
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-dark-200 bg-dark-50/50'
                          }`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center border ${
                            isActive
                              ? 'border-dark-900 text-dark-900'
                              : isComplete
                              ? 'border-green-500/30 text-green-400 bg-green-500/10'
                              : 'border-dark-200 text-dark-400'
                          }`}>
                            {isActive ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isComplete ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            isActive
                              ? 'text-dark-900'
                              : isComplete
                              ? 'text-green-400'
                              : 'text-dark-400'
                          }`}>
                            {step.label}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {claimStatus === 'success' && claimResult && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className={`w-12 h-12 border flex items-center justify-center mx-auto mb-4 ${
                    claimResult.outcome === 'CLAIMED' ? 'border-green-500/30' : 'border-red-500/30'
                  }`}>
                    {claimResult.outcome === 'CLAIMED' ? (
                      <PartyPopper className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-dark-900 mb-2 uppercase tracking-wider">
                    {claimResult.outcome === 'CLAIMED' ? 'Claim Approved!' : 'Not Eligible'}
                  </h2>

                  <p className="text-dark-500 text-sm mb-6">
                    {claimResult.outcome === 'CLAIMED' ? (
                      <>
                        Your trip was {claimResult.cancelled ? 'cancelled' : `delayed by ${claimResult.delayMinutes} minutes`}.
                        <br />
                        Refund: <span className="font-mono font-bold text-green-400">
                          {formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), claimResult.delayMinutes, claimResult.cancelled).refundAmount)} C2FLR
                        </span>{' '}
                        ({getRefundPercent(claimResult.delayMinutes, claimResult.cancelled)}% of ticket price)
                      </>
                    ) : (
                      <>
                        Your trip was only delayed by {claimResult.delayMinutes} minutes
                        (less than 3 hours). No refund applies.
                      </>
                    )}
                  </p>

                  {claimResult.txHash && (
                    <div className="bg-dark-100 p-4 mb-6">
                      <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-widest">Transaction Hash</p>
                      <a
                        href={getTxExplorerUrl(claimResult.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-700 hover:text-dark-900 font-mono text-xs break-all flex items-center justify-center gap-1"
                      >
                        {claimResult.txHash}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}

                  <Link to="/policies">
                    <Button variant="secondary">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Policies
                    </Button>
                  </Link>
                </motion.div>
              )}

              {claimStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-12 h-12 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                    Verification Failed
                  </h2>
                  <p className="text-dark-500 text-sm mb-6">{error}</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="secondary" onClick={() => setClaimStatus('idle')}>
                      Try Again
                    </Button>
                    <Link to="/policies">
                      <Button variant="ghost">
                        Back to Policies
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 border border-dark-200">
          <h3 className="text-xs font-bold text-dark-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Shield className="w-3 h-3" />
            How FDC Verification Works
          </h3>
          <ul className="text-xs text-dark-500 space-y-1 font-mono">
            <li>1. Backend queries transport status from external API</li>
            <li>2. Flare Data Connector creates cryptographic attestation</li>
            <li>3. Smart contract verifies proof on-chain (trustless!)</li>
            <li>4. If verified delayed/cancelled, payout is automatic</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
