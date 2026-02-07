pragma solidity ^0.8.20;

import "./interfaces/IFDCVerifier.sol";

contract DelayClaimInsurance {
    enum TripType { FLIGHT, TRAIN }
    enum PolicyStatus { ACTIVE, CLAIMED, REJECTED, EXPIRED }

    struct Policy {
        address owner;
        TripType tripType;
        bytes32 tripIdHash;
        uint64 travelDate;
        uint16 thresholdMinutes;
        uint256 payoutAmount;
        uint64 deadline;
        PolicyStatus status;
        uint64 createdAt;
    }

    struct TripStatus {
        bytes32 tripIdHash;
        uint64 travelDate;
        bool cancelled;
        uint16 delayMinutes;
        uint64 observedAt;
    }

    struct FDCProof {
        bytes32[] merkleProof;
        bytes32 attestationId;
    }

    address public owner;
    uint256 public poolBalance;
    uint256 public policyCounter;
    
    IFDCVerifier public fdcVerifier;
    
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;
    
    mapping(bytes32 => bool) public usedAttestations;

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed owner,
        bytes32 tripIdHash,
        uint64 travelDate,
        uint256 payoutAmount,
        uint16 thresholdMinutes,
        uint64 deadline
    );
    
    event PolicyResolved(
        uint256 indexed policyId,
        PolicyStatus outcome,
        uint16 delayMinutes,
        bool cancelled
    );
    
    event PolicyExpired(uint256 indexed policyId);
    
    event PoolFunded(address indexed funder, uint256 amount);
    
    event PoolWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier policyExists(uint256 policyId) {
        require(policyId > 0 && policyId <= policyCounter, "Policy does not exist");
        _;
    }

    constructor(address _fdcVerifier) {
        owner = msg.sender;
        fdcVerifier = IFDCVerifier(_fdcVerifier);
    }

    
    
    function createPolicy(
        TripType tripType,
        string calldata tripIdString,
        uint64 travelDate,
        uint16 thresholdMinutes,
        uint256 payoutAmount,
        uint64 deadline
    ) external payable returns (uint256 policyId) {
        require(bytes(tripIdString).length > 0, "Trip ID required");
        require(travelDate > block.timestamp, "Travel date must be future");
        require(deadline > travelDate, "Deadline must be after travel");
        require(thresholdMinutes > 0, "Threshold must be positive");
        require(payoutAmount > 0, "Payout must be positive");
        
        uint256 minPremium = payoutAmount / 10;
        require(msg.value >= minPremium, "Insufficient premium");

        policyCounter++;
        policyId = policyCounter;

        bytes32 tripIdHash = keccak256(bytes(tripIdString));

        policies[policyId] = Policy({
            owner: msg.sender,
            tripType: tripType,
            tripIdHash: tripIdHash,
            travelDate: travelDate,
            thresholdMinutes: thresholdMinutes,
            payoutAmount: payoutAmount,
            deadline: deadline,
            status: PolicyStatus.ACTIVE,
            createdAt: uint64(block.timestamp)
        });

        userPolicies[msg.sender].push(policyId);
        
        poolBalance += msg.value;

        emit PolicyCreated(
            policyId,
            msg.sender,
            tripIdHash,
            travelDate,
            payoutAmount,
            thresholdMinutes,
            deadline
        );

        return policyId;
    }

    
    function submitTripProof(
        uint256 policyId,
        TripStatus calldata tripStatus,
        FDCProof calldata proof
    ) external policyExists(policyId) {
        Policy storage policy = policies[policyId];
        
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        require(block.timestamp <= policy.deadline, "Claim deadline passed");
        require(block.timestamp >= policy.travelDate, "Travel date not reached");
        
        require(tripStatus.tripIdHash == policy.tripIdHash, "Trip ID mismatch");
        require(tripStatus.travelDate == policy.travelDate, "Travel date mismatch");
        
        require(!usedAttestations[proof.attestationId], "Attestation already used");
        require(
            _verifyFDCProof(tripStatus, proof),
            "Invalid FDC proof"
        );
        
        usedAttestations[proof.attestationId] = true;

        bool qualifies = tripStatus.cancelled || 
                        tripStatus.delayMinutes >= policy.thresholdMinutes;

        if (qualifies) {
            policy.status = PolicyStatus.CLAIMED;
            
            require(poolBalance >= policy.payoutAmount, "Insufficient pool balance");
            poolBalance -= policy.payoutAmount;

            (bool success, ) = policy.owner.call{value: policy.payoutAmount}("");
            require(success, "Payout transfer failed");

            emit PolicyResolved(
                policyId,
                PolicyStatus.CLAIMED,
                tripStatus.delayMinutes,
                tripStatus.cancelled
            );
        } else {
            policy.status = PolicyStatus.REJECTED;
            
            emit PolicyResolved(
                policyId,
                PolicyStatus.REJECTED,
                tripStatus.delayMinutes,
                tripStatus.cancelled
            );
        }
    }

    
    function expirePolicy(uint256 policyId) external policyExists(policyId) {
        Policy storage policy = policies[policyId];
        
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        require(block.timestamp > policy.deadline, "Deadline not passed");

        policy.status = PolicyStatus.EXPIRED;

        emit PolicyExpired(policyId);
    }

    
    function fundPool() external payable {
        require(msg.value > 0, "Must send value");
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    
    function withdrawPool(uint256 amount) external onlyOwner {
        uint256 maxWithdraw = (poolBalance * 90) / 100;
        require(amount <= maxWithdraw, "Exceeds safe withdrawal limit");
        require(amount <= address(this).balance, "Insufficient balance");

        poolBalance -= amount;

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit PoolWithdrawn(owner, amount);
    }

    
    
    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        return policies[policyId];
    }

    
    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    
    function setFDCVerifier(address _fdcVerifier) external onlyOwner {
        fdcVerifier = IFDCVerifier(_fdcVerifier);
    }

    
    
    function _verifyFDCProof(
        TripStatus calldata tripStatus,
        FDCProof calldata proof
    ) internal view returns (bool) {
        if (address(fdcVerifier) == address(0)) {
            return proof.attestationId != bytes32(0) && proof.merkleProof.length > 0;
        }

        bytes memory attestationData = abi.encode(
            tripStatus.tripIdHash,
            tripStatus.travelDate,
            tripStatus.cancelled,
            tripStatus.delayMinutes,
            tripStatus.observedAt
        );

        return fdcVerifier.verifyAttestation(
            proof.attestationId,
            proof.merkleProof,
            attestationData
        );
    }

    receive() external payable {
        poolBalance += msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }
}
