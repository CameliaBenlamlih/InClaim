// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IFDCVerifier.sol";

/**
 * @title MockFDCVerifier
 * @notice Mock FDC verifier for testing and demo purposes
 * @dev In production, this would be replaced by the actual Flare FDC verifier
 */
contract MockFDCVerifier is IFDCVerifier {
    address public owner;
    
    // Mapping of attestation IDs to their validity
    mapping(bytes32 => bool) public validAttestations;
    
    // Mapping of round IDs to merkle roots
    mapping(uint256 => bytes32) public merkleRoots;
    
    // Current round ID
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

    /**
     * @notice Register a valid attestation (for demo/testing)
     * @param attestationId The attestation ID to register
     */
    function registerAttestation(bytes32 attestationId) external onlyOwner {
        validAttestations[attestationId] = true;
        emit AttestationRegistered(attestationId);
    }

    /**
     * @notice Set merkle root for a round (for demo/testing)
     * @param roundId The round ID
     * @param root The merkle root
     */
    function setMerkleRoot(uint256 roundId, bytes32 root) external onlyOwner {
        merkleRoots[roundId] = root;
        emit MerkleRootSet(roundId, root);
    }

    /**
     * @notice Verify an attestation proof
     * @dev For demo, this simply checks if attestation was registered
     */
    function verifyAttestation(
        bytes32 attestationId,
        bytes32[] calldata merkleProof,
        bytes memory /* attestationData */
    ) external view override returns (bool valid) {
        // For demo: check if attestation is registered and proof is non-empty
        return validAttestations[attestationId] && merkleProof.length > 0;
    }

    /**
     * @notice Get the merkle root for a given voting round
     */
    function getMerkleRoot(uint256 roundId) external view override returns (bytes32 root) {
        return merkleRoots[roundId];
    }

    /**
     * @notice Check if an attestation request exists
     */
    function attestationExists(bytes32 attestationId) external view override returns (bool exists) {
        return validAttestations[attestationId];
    }

    /**
     * @notice Batch register attestations
     */
    function batchRegisterAttestations(bytes32[] calldata attestationIds) external onlyOwner {
        for (uint i = 0; i < attestationIds.length; i++) {
            validAttestations[attestationIds[i]] = true;
            emit AttestationRegistered(attestationIds[i]);
        }
    }
}
