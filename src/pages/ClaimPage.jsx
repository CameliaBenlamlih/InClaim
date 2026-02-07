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
            <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading policy...</p>
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
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Policy Not Found
            </h2>
            <p className="text-gray-600 mb-6">
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
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </Link>

        {/* Policy Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                policyData.tripType === 0 ? 'bg-primary-50' : 'bg-primary-50'
              }`}>
                <Icon className={`w-7 h-7 ${
                  policyData.tripType === 0 ? 'text-primary-500' : 'text-primary-500'
                }`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-display font-bold text-gray-900">
                    Policy #{policyData.id}
                  </h1>
                  <StatusBadge status={isExpired ? 3 : policyData.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="font-medium text-gray-900">
                      {getTripTypeLabel(policyData.tripType)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Travel Date</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(policyData.travelDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Threshold</span>
                    <p className="font-medium text-gray-900">
                      {policyData.thresholdMinutes} min
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ticket Price</span>
                    <p className="font-medium text-gray-900">
                      {formatC2FLR(policyData.payoutAmount)} C2FLR
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Deadline: {formatDate(policyData.deadline)}
                  </div>
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
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Claim Approved!
                      </h2>
                      <p className="text-gray-600">
                        This policy has been successfully claimed and paid out.
                      </p>
                    </div>
                  ) : policyData.status === 2 ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Claim Rejected
                      </h2>
                      <p className="text-gray-600">
                        The trip was not delayed beyond the threshold. No payout.
                      </p>
                    </div>
                  ) : isExpired ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Policy Expired
                      </h2>
                      <p className="text-gray-600">
                        The claim deadline has passed for this policy.
                      </p>
                    </div>
                  ) : !canClaim ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Not Yet Claimable
                      </h2>
                      <p className="text-gray-600">
                        You can claim after your travel date: {formatDate(policyData.travelDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary-500" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Ready to Verify
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Click below to verify your trip status using real flight data.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left">
                        <p className="font-semibold text-gray-900 mb-2">Potential Refunds:</p>
                        <div className="space-y-1 text-gray-600">
                          <p>• 3-23h delay: <span className="font-semibold text-yellow-600">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 180).refundAmount)} C2FLR</span> (20%)</p>
                          <p>• ≥24h delay: <span className="font-semibold text-orange-600">{formatC2FLR(calculateRefund(formatC2FLR(policyData.payoutAmount), 1440).refundAmount)} C2FLR</span> (50%)</p>
                          <p>• Cancelled: <span className="font-semibold text-red-600">{formatC2FLR(policyData.payoutAmount)} C2FLR</span> (100%)</p>
                        </div>
                      </div>
                      <Button size="lg" onClick={handleClaim}>
                        <Shield className="w-5 h-5" />
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
                  <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
                    Verifying Trip Status...
                  </h2>

                  <div className="space-y-4">
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
                          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                            isActive
                              ? 'bg-primary-50 border border-primary-200'
                              : isComplete
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive
                              ? 'bg-primary-500 text-white'
                              : isComplete
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {isActive ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isComplete ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>
                          <span className={`font-medium ${
                            isActive
                              ? 'text-primary-700'
                              : isComplete
                              ? 'text-green-700'
                              : 'text-gray-400'
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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    claimResult.outcome === 'CLAIMED' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {claimResult.outcome === 'CLAIMED' ? (
                      <PartyPopper className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>

                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
                    {claimResult.outcome === 'CLAIMED' ? 'Claim Approved!' : 'Not Eligible'}
                  </h2>

                  <p className="text-gray-600 mb-6">
                    {claimResult.outcome === 'CLAIMED' ? (
                      <>
                        Your trip was {claimResult.cancelled ? 'cancelled' : `delayed by ${claimResult.delayMinutes} minutes`}.
                        <br />
                        Refund: <span className="font-semibold text-green-600">
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
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                      <a
                        href={getTxExplorerUrl(claimResult.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-500 hover:text-primary-600 font-mono text-sm break-all flex items-center justify-center gap-1"
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
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-600 mb-6">{error}</p>
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
        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            How FDC Verification Works
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
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
