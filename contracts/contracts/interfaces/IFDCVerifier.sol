pragma solidity ^0.8.20;

interface IFDCVerifier {
    
    function verifyAttestation(
        bytes32 attestationId,
        bytes32[] calldata merkleProof,
        bytes memory attestationData
    ) external view returns (bool valid);

    
    function getMerkleRoot(uint256 roundId) external view returns (bytes32 root);

    
    function attestationExists(bytes32 attestationId) external view returns (bool exists);
}
