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
  
  const [claimStatus, setClaimStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState('');

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
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

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
            <p className="text-dark-500 text-xs">Loading policy...</p>
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
            <h2 className="font-serif text-xl text-dark-900 mb-2">
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
        {}
        <Link
          to="/policies"
          className="inline-flex items-center gap-2 text-dark-500 hover:text-dark-900 mb-6 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Policies
        </Link>

        {}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-dark-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-dark-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-serif text-xl text-dark-900">
                    Policy #{policyData.id}
                  </h1>
                  <StatusBadge status={isExpired ? 3 : policyData.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-dark-400 uppercase tracking-wider text-[10px]">Type</span>
                    <p className="text-dark-900 mt-0.5">
                      {getTripTypeLabel(policyData.tripType)}
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-wider text-[10px]">Travel Date</span>
                    <p className="text-dark-900 mt-0.5">
                      {formatDate(policyData.travelDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-wider text-[10px]">Threshold</span>
                    <p className="text-dark-900 mt-0.5">
                      {policyData.thresholdMinutes} min
                    </p>
                  </div>
                  <div>
                    <span className="text-dark-400 uppercase tracking-wider text-[10px]">Ticket Price</span>
                    <p className="text-dark-900 mt-0.5">
                      {formatC2FLR(policyData.payoutAmount)} C2FLR
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-200 flex items-center gap-2 text-[10px] text-dark-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Deadline: {formatDate(policyData.deadline)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
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
                      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <h2 className="font-serif text-xl text-dark-900 mb-2">
                        Claim Approved!
                      </h2>
                      <p className="text-dark-500 text-sm">
                        This policy has been successfully claimed and paid out.
                      </p>
                    </div>
                  ) : policyData.status === 2 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <h2 className="font-serif text-xl text-dark-900 mb-2">
                        Claim Rejected
                      </h2>
                      <p className="text-dark-500 text-sm">
                        The trip was not delayed beyond the threshold. No payout.
                      </p>
                    </div>
                  ) : isExpired ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-dark-100 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-5 h-5 text-dark-400" />
                      </div>
                      <h2 className="font-serif text-xl text-dark-900 mb-2">
                        Policy Expired
                      </h2>
                      <p className="text-dark-500 text-sm">
                        The claim deadline has passed for this policy.
                      </p>
                    </div>
                  ) : !canClaim ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <h2 className="font-serif text-xl text-dark-900 mb-2">
                        Not Yet Claimable
                      </h2>
                      <p className="text-dark-500 text-sm">
                        You can claim after your travel date: {formatDate(policyData.travelDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <h2 className="font-serif text-xl text-dark-900 mb-2">
                        Ready to Verify
                      </h2>
                      <p className="text-dark-500 text-sm mb-4">
                        Click below to verify your trip status using real flight data.
                      </p>
                      <div className="bg-dark-50 rounded-sm p-4 mb-6 text-left">
                        <p className="text-xs font-semibold text-dark-900 mb-2">Potential Refunds:</p>
                        <div className="space-y-1 text-[11px] text-dark-500">
                          <p>3-23h delay: <span className="font-semibold text-yellow-600">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 180).refundAmount)} C2FLR</span> (20%)</p>
                          <p>24h+ delay: <span className="font-semibold text-orange-500">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 1440).refundAmount)} C2FLR</span> (50%)</p>
                          <p>Cancelled: <span className="font-semibold text-red-500">{formatC2FLR(policyData.payoutAmount)} C2FLR</span> (100%)</p>
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
                  <h2 className="font-serif text-xl text-dark-900 text-center mb-8">
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
                          className={`flex items-center gap-4 p-4 border rounded-sm transition-colors ${
                            isActive
                              ? 'border-dark-900 bg-surface'
                              : isComplete
                              ? 'border-green-200 bg-green-50'
                              : 'border-dark-200 bg-dark-50'
                          }`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            isActive
                              ? 'bg-dark-900 text-white'
                              : isComplete
                              ? 'bg-green-50 text-green-500 border border-green-200'
                              : 'bg-dark-100 text-dark-400'
                          }`}>
                            {isActive ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isComplete ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <StepIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            isActive
                              ? 'text-dark-900'
                              : isComplete
                              ? 'text-green-600'
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    claimResult.outcome === 'CLAIMED' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {claimResult.outcome === 'CLAIMED' ? (
                      <PartyPopper className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <h2 className="font-serif text-xl text-dark-900 mb-2">
                    {claimResult.outcome === 'CLAIMED' ? 'Claim Approved!' : 'Not Eligible'}
                  </h2>

                  <p className="text-dark-500 text-sm mb-6">
                    {claimResult.outcome === 'CLAIMED' ? (
                      <>
                        Your trip was {claimResult.cancelled ? 'cancelled' : `delayed by ${claimResult.delayMinutes} minutes`}.
                        <br />
                        Refund: <span className="font-mono font-semibold text-green-600">
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
                    <div className="bg-dark-50 rounded-sm p-4 mb-6">
                      <p className="text-[10px] text-dark-500 mb-1 uppercase tracking-wider">Transaction Hash</p>
                      <a
                        href={getTxExplorerUrl(claimResult.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-dark font-mono text-xs break-all flex items-center justify-center gap-1"
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
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="font-serif text-xl text-dark-900 mb-2">
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

        {}
        <div className="mt-6 p-4 bg-surface rounded-sm border border-dark-200/50">
          <h3 className="text-xs font-semibold text-dark-900 mb-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-accent" />
            How FDC Verification Works
          </h3>
          <ul className="text-xs text-dark-500 space-y-1">
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
