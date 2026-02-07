pragma solidity ^0.8.20;

import "./interfaces/IFDCVerifier.sol";

contract MockFDCVerifier is IFDCVerifier {
    address public owner;
    
    mapping(bytes32 => bool) public validAttestations;
    
    mapping(uint256 => bytes32) public merkleRoots;
    
    uint256 public currentRound;

    event AttestationRegistered(bytes32 indexed attestationId);
    event MerkleRootSet(uint256 indexed roundId, bytes32 root);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentRound = 1;
    }

    
    function registerAttestation(bytes32 attestationId) external onlyOwner {
        validAttestations[attestationId] = true;
        emit AttestationRegistered(attestationId);
    }

    
    function setMerkleRoot(uint256 roundId, bytes32 root) external onlyOwner {
        merkleRoots[roundId] = root;
        emit MerkleRootSet(roundId, root);
    }

    
    function verifyAttestation(
        bytes32 attestationId,
        bytes32[] calldata merkleProof,
        bytes memory 
    ) external view override returns (bool valid) {
        return validAttestations[attestationId] && merkleProof.length > 0;
    }

    
    function getMerkleRoot(uint256 roundId) external view override returns (bytes32 root) {
        return merkleRoots[roundId];
    }

    
    function attestationExists(bytes32 attestationId) external view override returns (bool exists) {
        return validAttestations[attestationId];
    }

    
    function batchRegisterAttestations(bytes32[] calldata attestationIds) external onlyOwner {
        for (uint i = 0; i < attestationIds.length; i++) {
            validAttestations[attestationIds[i]] = true;
            emit AttestationRegistered(attestationIds[i]);
        }
    }
}
