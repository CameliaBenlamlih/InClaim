// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFDCVerifier
 * @notice Interface for Flare Data Connector attestation verification
 * @dev This interface defines how to verify FDC proofs on-chain
 */
interface IFDCVerifier {
    /**
     * @notice Verify an attestation proof
     * @param attestationId The unique ID of the attestation
     * @param merkleProof The merkle proof path
     * @param attestationData The encoded attestation data to verify
     * @return valid True if the proof is valid
     */
    function verifyAttestation(
        bytes32 attestationId,
        bytes32[] calldata merkleProof,
        bytes memory attestationData
    ) external view returns (bool valid);

    /**
     * @notice Get the merkle root for a given voting round
     * @param roundId The voting round ID
     * @return root The merkle root
     */
    function getMerkleRoot(uint256 roundId) external view returns (bytes32 root);

    /**
     * @notice Check if an attestation request exists
     * @param attestationId The attestation ID to check
     * @return exists True if the attestation exists
     */
    function attestationExists(bytes32 attestationId) external view returns (bool exists);
}
