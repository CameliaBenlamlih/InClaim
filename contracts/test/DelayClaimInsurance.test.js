const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DelayClaimInsurance", function () {
  let insurance;
  let mockVerifier;
  let owner;
  let user1;
  let user2;

  const ONE_DAY = 24 * 60 * 60;
  const SEVEN_DAYS = 7 * ONE_DAY;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy MockFDCVerifier
    const MockFDCVerifier = await ethers.getContractFactory("MockFDCVerifier");
    mockVerifier = await MockFDCVerifier.deploy();
    await mockVerifier.waitForDeployment();

    // Deploy DelayClaimInsurance
    const DelayClaimInsurance = await ethers.getContractFactory("DelayClaimInsurance");
    insurance = await DelayClaimInsurance.deploy(await mockVerifier.getAddress());
    await insurance.waitForDeployment();

    // Fund the pool
    await insurance.fundPool({ value: ethers.parseEther("100") });
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await insurance.owner()).to.equal(owner.address);
    });

    it("Should have initial pool balance", async function () {
      expect(await insurance.poolBalance()).to.equal(ethers.parseEther("100"));
    });

    it("Should start with policy counter at 0", async function () {
      expect(await insurance.policyCounter()).to.equal(0);
    });
  });

  describe("Create Policy", function () {
    it("Should create a policy successfully", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;
      const payoutAmount = ethers.parseEther("5");
      const premium = payoutAmount / 10n;

      await expect(
        insurance.connect(user1).createPolicy(
          0, // FLIGHT
          "BA123",
          travelDate,
          60, // 60 minutes threshold
          payoutAmount,
          deadline,
          { value: premium }
        )
      )
        .to.emit(insurance, "PolicyCreated")
        .withArgs(
          1,
          user1.address,
          ethers.keccak256(ethers.toUtf8Bytes("BA123")),
          travelDate,
          payoutAmount,
          60,
          deadline
        );

      expect(await insurance.policyCounter()).to.equal(1);
    });

    it("Should fail if travel date is in the past", async function () {
      const travelDate = (await time.latest()) - ONE_DAY;
      const deadline = (await time.latest()) + SEVEN_DAYS;

      await expect(
        insurance.connect(user1).createPolicy(
          0,
          "BA123",
          travelDate,
          60,
          ethers.parseEther("5"),
          deadline,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Travel date must be future");
    });

    it("Should fail if premium is insufficient", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await expect(
        insurance.connect(user1).createPolicy(
          0,
          "BA123",
          travelDate,
          60,
          ethers.parseEther("5"),
          deadline,
          { value: ethers.parseEther("0.1") } // Less than 10%
        )
      ).to.be.revertedWith("Insufficient premium");
    });

    it("Should fail if trip ID is empty", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await expect(
        insurance.connect(user1).createPolicy(
          0,
          "",
          travelDate,
          60,
          ethers.parseEther("5"),
          deadline,
          { value: ethers.parseEther("0.5") }
        )
      ).to.be.revertedWith("Trip ID required");
    });
  });

  describe("Submit Trip Proof", function () {
    let policyId;
    let travelDate;
    let tripIdHash;

    beforeEach(async function () {
      travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;
      tripIdHash = ethers.keccak256(ethers.toUtf8Bytes("BA123"));

      await insurance.connect(user1).createPolicy(
        0,
        "BA123",
        travelDate,
        60,
        ethers.parseEther("5"),
        deadline,
        { value: ethers.parseEther("0.5") }
      );
      policyId = 1;

      // Move time to after travel date
      await time.increase(ONE_DAY + 1);
    });

    it("Should approve claim when delay exceeds threshold", async function () {
      const attestationId = ethers.keccak256(ethers.toUtf8Bytes("attestation1"));
      
      // Register attestation in mock verifier
      await mockVerifier.registerAttestation(attestationId);

      const tripStatus = {
        tripIdHash: tripIdHash,
        travelDate: travelDate,
        cancelled: false,
        delayMinutes: 90, // Above 60 minute threshold
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("proof1"))],
        attestationId: attestationId,
      };

      const user1BalanceBefore = await ethers.provider.getBalance(user1.address);

      await expect(insurance.submitTripProof(policyId, tripStatus, proof))
        .to.emit(insurance, "PolicyResolved")
        .withArgs(policyId, 1, 90, false); // 1 = CLAIMED

      const policy = await insurance.getPolicy(policyId);
      expect(policy.status).to.equal(1); // CLAIMED

      const user1BalanceAfter = await ethers.provider.getBalance(user1.address);
      expect(user1BalanceAfter - user1BalanceBefore).to.equal(ethers.parseEther("5"));
    });

    it("Should approve claim when trip is cancelled", async function () {
      const attestationId = ethers.keccak256(ethers.toUtf8Bytes("attestation2"));
      await mockVerifier.registerAttestation(attestationId);

      const tripStatus = {
        tripIdHash: tripIdHash,
        travelDate: travelDate,
        cancelled: true,
        delayMinutes: 0,
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("proof2"))],
        attestationId: attestationId,
      };

      await expect(insurance.submitTripProof(policyId, tripStatus, proof))
        .to.emit(insurance, "PolicyResolved")
        .withArgs(policyId, 1, 0, true); // CLAIMED
    });

    it("Should reject claim when delay is below threshold", async function () {
      const attestationId = ethers.keccak256(ethers.toUtf8Bytes("attestation3"));
      await mockVerifier.registerAttestation(attestationId);

      const tripStatus = {
        tripIdHash: tripIdHash,
        travelDate: travelDate,
        cancelled: false,
        delayMinutes: 30, // Below 60 minute threshold
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("proof3"))],
        attestationId: attestationId,
      };

      await expect(insurance.submitTripProof(policyId, tripStatus, proof))
        .to.emit(insurance, "PolicyResolved")
        .withArgs(policyId, 2, 30, false); // 2 = REJECTED

      const policy = await insurance.getPolicy(policyId);
      expect(policy.status).to.equal(2); // REJECTED
    });

    it("Should fail with invalid attestation", async function () {
      const tripStatus = {
        tripIdHash: tripIdHash,
        travelDate: travelDate,
        cancelled: false,
        delayMinutes: 90,
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("fake"))],
        attestationId: ethers.keccak256(ethers.toUtf8Bytes("unregistered")),
      };

      await expect(
        insurance.submitTripProof(policyId, tripStatus, proof)
      ).to.be.revertedWith("Invalid FDC proof");
    });

    it("Should fail with wrong trip ID", async function () {
      const attestationId = ethers.keccak256(ethers.toUtf8Bytes("attestation4"));
      await mockVerifier.registerAttestation(attestationId);

      const tripStatus = {
        tripIdHash: ethers.keccak256(ethers.toUtf8Bytes("WRONG123")),
        travelDate: travelDate,
        cancelled: true,
        delayMinutes: 0,
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("proof4"))],
        attestationId: attestationId,
      };

      await expect(
        insurance.submitTripProof(policyId, tripStatus, proof)
      ).to.be.revertedWith("Trip ID mismatch");
    });

    it("Should prevent double claims", async function () {
      const attestationId = ethers.keccak256(ethers.toUtf8Bytes("attestation5"));
      await mockVerifier.registerAttestation(attestationId);

      const tripStatus = {
        tripIdHash: tripIdHash,
        travelDate: travelDate,
        cancelled: true,
        delayMinutes: 0,
        observedAt: await time.latest(),
      };

      const proof = {
        merkleProof: [ethers.keccak256(ethers.toUtf8Bytes("proof5"))],
        attestationId: attestationId,
      };

      await insurance.submitTripProof(policyId, tripStatus, proof);

      // Try to claim again with same attestation
      await expect(
        insurance.submitTripProof(policyId, tripStatus, proof)
      ).to.be.revertedWith("Policy not active");
    });
  });

  describe("Expire Policy", function () {
    it("Should expire policy after deadline", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await insurance.connect(user1).createPolicy(
        0,
        "BA123",
        travelDate,
        60,
        ethers.parseEther("5"),
        deadline,
        { value: ethers.parseEther("0.5") }
      );

      // Move time past deadline
      await time.increase(ONE_DAY + SEVEN_DAYS + 1);

      await expect(insurance.expirePolicy(1))
        .to.emit(insurance, "PolicyExpired")
        .withArgs(1);

      const policy = await insurance.getPolicy(1);
      expect(policy.status).to.equal(3); // EXPIRED
    });

    it("Should fail to expire before deadline", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await insurance.connect(user1).createPolicy(
        0,
        "BA123",
        travelDate,
        60,
        ethers.parseEther("5"),
        deadline,
        { value: ethers.parseEther("0.5") }
      );

      await expect(insurance.expirePolicy(1)).to.be.revertedWith(
        "Deadline not passed"
      );
    });
  });

  describe("Pool Management", function () {
    it("Should allow funding the pool", async function () {
      const initialBalance = await insurance.poolBalance();
      
      await expect(insurance.fundPool({ value: ethers.parseEther("10") }))
        .to.emit(insurance, "PoolFunded")
        .withArgs(owner.address, ethers.parseEther("10"));

      expect(await insurance.poolBalance()).to.equal(
        initialBalance + ethers.parseEther("10")
      );
    });

    it("Should allow owner to withdraw within limits", async function () {
      const poolBalance = await insurance.poolBalance();
      const maxWithdraw = (poolBalance * 90n) / 100n;

      await expect(insurance.withdrawPool(maxWithdraw))
        .to.emit(insurance, "PoolWithdrawn")
        .withArgs(owner.address, maxWithdraw);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      await expect(
        insurance.connect(user1).withdrawPool(ethers.parseEther("1"))
      ).to.be.revertedWith("Not owner");
    });

    it("Should prevent over-withdrawal", async function () {
      const poolBalance = await insurance.poolBalance();
      
      await expect(
        insurance.withdrawPool(poolBalance) // 100% withdrawal attempt
      ).to.be.revertedWith("Exceeds safe withdrawal limit");
    });
  });

  describe("View Functions", function () {
    it("Should return user policies", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await insurance.connect(user1).createPolicy(
        0, "BA123", travelDate, 60, ethers.parseEther("5"), deadline,
        { value: ethers.parseEther("0.5") }
      );

      await insurance.connect(user1).createPolicy(
        1, "IC502", travelDate, 30, ethers.parseEther("2"), deadline,
        { value: ethers.parseEther("0.2") }
      );

      const userPolicies = await insurance.getUserPolicies(user1.address);
      expect(userPolicies.length).to.equal(2);
      expect(userPolicies[0]).to.equal(1);
      expect(userPolicies[1]).to.equal(2);
    });

    it("Should return policy details", async function () {
      const travelDate = (await time.latest()) + ONE_DAY;
      const deadline = travelDate + SEVEN_DAYS;

      await insurance.connect(user1).createPolicy(
        0, "BA123", travelDate, 60, ethers.parseEther("5"), deadline,
        { value: ethers.parseEther("0.5") }
      );

      const policy = await insurance.getPolicy(1);
      expect(policy.owner).to.equal(user1.address);
      expect(policy.tripType).to.equal(0);
      expect(policy.thresholdMinutes).to.equal(60);
      expect(policy.status).to.equal(0); // ACTIVE
    });
  });
});
