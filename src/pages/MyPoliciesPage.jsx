import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { 
  Plane, 
  Train, 
  Calendar, 
  Clock, 
  Coins,
  ExternalLink,
  ChevronRight,
  Inbox,
  RefreshCw
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { 
  CONTRACT_ADDRESS, 
  CONTRACT_ABI, 
  getAddressExplorerUrl,
  getTxExplorerUrl 
} from '../lib/contract';
import { 
  formatDate, 
  formatC2FLR, 
  getTripTypeLabel,
  shortenAddress
} from '../lib/utils';

export default function MyPoliciesPage() {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const [policies, setPolicies] = useState([]);

  // Get user's policy IDs
  const { data: policyIds, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserPolicies',
    args: [address],
    enabled: !!address && isConnected,
  });

  // Create contract calls for each policy
  const policyContracts = policyIds?.map((id) => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPolicy',
    args: [id],
  })) || [];

  const { data: policyData, isLoading: isPoliciesLoading } = useReadContracts({
    contracts: policyContracts,
    enabled: policyContracts.length > 0,
  });

  useEffect(() => {
    if (policyData && policyIds) {
      const formattedPolicies = policyData
        .map((result, index) => {
          if (result.status === 'success' && result.result) {
            const p = result.result;
            return {
              id: policyIds[index].toString(),
              owner: p.owner,
              tripType: Number(p.tripType),
              tripIdHash: p.tripIdHash,
              travelDate: Number(p.travelDate),
              thresholdMinutes: Number(p.thresholdMinutes),
              payoutAmount: p.payoutAmount,
              deadline: Number(p.deadline),
              status: Number(p.status),
              createdAt: Number(p.createdAt),
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.createdAt - a.createdAt);
      
      setPolicies(formattedPolicies);
    }
  }, [policyData, policyIds]);

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 border border-dark-200 flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-5 h-5 text-dark-500" />
            </div>
            <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
              Connect Your Wallet
            </h2>
            <p className="text-dark-500 text-sm mb-6">
              Connect your wallet to view your insurance policies
            </p>
            <Button onClick={() => open()}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 mb-2 uppercase tracking-wider">
              My Policies
            </h1>
            <p className="text-dark-500 text-sm">
              Manage your travel delay insurance policies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => refetch()}
              disabled={isLoading || isPoliciesLoading}
            >
              <RefreshCw className={`w-3 h-3 ${isLoading || isPoliciesLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link to="/create">
              <Button>
                New Policy
              </Button>
            </Link>
          </div>
        </div>

        {/* Policies List */}
        {isLoading || isPoliciesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 bg-dark-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-dark-100 w-1/4" />
                      <div className="h-2 bg-dark-100 w-1/2" />
                    </div>
                    <div className="w-16 h-6 bg-dark-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : policies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border border-dark-200 flex items-center justify-center mx-auto mb-6">
                <Inbox className="w-5 h-5 text-dark-500" />
              </div>
              <h2 className="text-sm font-bold text-dark-900 mb-2 uppercase tracking-wider">
                No Policies Yet
              </h2>
              <p className="text-dark-500 text-sm mb-6">
                Create your first travel delay insurance policy
              </p>
              <Link to="/create">
                <Button>
                  Create Policy
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {policies.map((policy, index) => (
              <PolicyCard key={policy.id} policy={policy} index={index} />
            ))}
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-8 p-4 border border-dark-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-dark-500 uppercase tracking-widest">Contract Address</span>
            <a
              href={getAddressExplorerUrl(CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-700 hover:text-dark-900 flex items-center gap-1 font-mono"
            >
              {shortenAddress(CONTRACT_ADDRESS, 6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PolicyCard({ policy, index }) {
  const Icon = policy.tripType === 0 ? Plane : Train;
  const canClaim = policy.status === 0 && Date.now() / 1000 > policy.travelDate;
  const isExpired = policy.status === 0 && Date.now() / 1000 > policy.deadline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-10 h-10 border border-dark-200 flex items-center justify-center">
              <Icon className="w-5 h-5 text-dark-900" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-sm font-bold text-dark-900 uppercase tracking-wider">
                  Policy #{policy.id}
                </h3>
                <StatusBadge status={isExpired ? 3 : policy.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-dark-400 uppercase tracking-widest text-[10px]">Type</span>
                  <p className="font-mono text-dark-900 mt-0.5">
                    {getTripTypeLabel(policy.tripType)}
                  </p>
                </div>
                <div>
                  <span className="text-dark-400 uppercase tracking-widest text-[10px]">Travel Date</span>
                  <p className="font-mono text-dark-900 mt-0.5">
                    {formatDate(policy.travelDate)}
                  </p>
                </div>
                <div>
                  <span className="text-dark-400 uppercase tracking-widest text-[10px]">Threshold</span>
                  <p className="font-mono text-dark-900 mt-0.5">
                    {policy.thresholdMinutes} min
                  </p>
                </div>
                <div>
                  <span className="text-dark-400 uppercase tracking-widest text-[10px]">Ticket Price</span>
                  <p className="font-mono text-dark-900 mt-0.5">
                    {formatC2FLR(policy.payoutAmount)} C2FLR
                  </p>
                </div>
              </div>

              {/* Deadline */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-dark-400 font-mono uppercase tracking-wider">
                <Clock className="w-3 h-3" />
                <span>Claim deadline: {formatDate(policy.deadline)}</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0">
              {canClaim && !isExpired ? (
                <Link to={`/claim/${policy.id}`}>
                  <Button size="sm">
                    Claim
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              ) : policy.status === 0 && !isExpired ? (
                <span className="text-[10px] text-dark-400 border border-dark-200 px-3 py-1.5 uppercase tracking-widest font-mono">
                  Not yet claimable
                </span>
              ) : (
                <Link to={`/claim/${policy.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
