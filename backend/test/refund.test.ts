/**
 * Unit tests for refund calculation utilities
 * Tests the fixed compensation policy implementation
 */

import { getRefundPercent, calculateRefundWei, getApplicablePolicy, getPolicyBreakdown } from '../src/utils/refund';

describe('Refund Calculation Utils', () => {
  describe('getRefundPercent', () => {
    test('should return 0% for delays under 3 hours', () => {
      expect(getRefundPercent(0, false)).toBe(0);
      expect(getRefundPercent(30, false)).toBe(0);
      expect(getRefundPercent(179, false)).toBe(0); // 2h59
    });

    test('should return 20% for delays >= 3 hours and < 24 hours', () => {
      expect(getRefundPercent(180, false)).toBe(20); // exactly 3h
      expect(getRefundPercent(300, false)).toBe(20); // 5h
      expect(getRefundPercent(1439, false)).toBe(20); // 23h59
    });

    test('should return 50% for delays >= 24 hours', () => {
      expect(getRefundPercent(1440, false)).toBe(50); // exactly 24h
      expect(getRefundPercent(2000, false)).toBe(50); // 33h+
      expect(getRefundPercent(10000, false)).toBe(50); // 166h+
    });

    test('should return 100% for cancellations regardless of delay', () => {
      expect(getRefundPercent(0, true)).toBe(100);
      expect(getRefundPercent(30, true)).toBe(100);
      expect(getRefundPercent(180, true)).toBe(100);
      expect(getRefundPercent(1440, true)).toBe(100);
    });

    test('should handle edge cases', () => {
      expect(getRefundPercent(-10, false)).toBe(0); // negative delay
      expect(getRefundPercent(NaN, false)).toBe(0); // NaN
    });
  });

  describe('calculateRefundWei', () => {
    const ticketPrice100 = BigInt('100000000000000000000'); // 100 C2FLR in wei

    test('should calculate 0% refund correctly', () => {
      const result = calculateRefundWei(ticketPrice100, 0, false);
      expect(result.refundPercent).toBe(0);
      expect(result.refundAmountWei).toBe(BigInt(0));
    });

    test('should calculate 20% refund correctly', () => {
      const result = calculateRefundWei(ticketPrice100, 180, false);
      expect(result.refundPercent).toBe(20);
      expect(result.refundAmountWei).toBe(BigInt('20000000000000000000')); // 20 C2FLR
    });

    test('should calculate 50% refund correctly', () => {
      const result = calculateRefundWei(ticketPrice100, 1440, false);
      expect(result.refundPercent).toBe(50);
      expect(result.refundAmountWei).toBe(BigInt('50000000000000000000')); // 50 C2FLR
    });

    test('should calculate 100% refund for cancellation', () => {
      const result = calculateRefundWei(ticketPrice100, 0, true);
      expect(result.refundPercent).toBe(100);
      expect(result.refundAmountWei).toBe(ticketPrice100); // 100 C2FLR
    });

    test('should work with different ticket prices', () => {
      const ticketPrice50 = BigInt('50000000000000000000'); // 50 C2FLR
      const result = calculateRefundWei(ticketPrice50, 180, false);
      expect(result.refundPercent).toBe(20);
      expect(result.refundAmountWei).toBe(BigInt('10000000000000000000')); // 10 C2FLR (20% of 50)
    });

    test('should handle very large ticket prices', () => {
      const ticketPrice1000 = BigInt('1000000000000000000000'); // 1000 C2FLR
      const result = calculateRefundWei(ticketPrice1000, 1440, false);
      expect(result.refundPercent).toBe(50);
      expect(result.refundAmountWei).toBe(BigInt('500000000000000000000')); // 500 C2FLR
    });
  });

  describe('getApplicablePolicy', () => {
    test('should return 0% policy for short delays', () => {
      const policy = getApplicablePolicy(100, false);
      expect(policy?.refundPercent).toBe(0);
      expect(policy?.label).toBe('0–2h59');
    });

    test('should return 20% policy for 3-23h delays', () => {
      const policy = getApplicablePolicy(300, false);
      expect(policy?.refundPercent).toBe(20);
      expect(policy?.label).toBe('≥ 3h');
    });

    test('should return 50% policy for 24h+ delays', () => {
      const policy = getApplicablePolicy(2000, false);
      expect(policy?.refundPercent).toBe(50);
      expect(policy?.label).toBe('≥ 24h');
    });

    test('should return 100% policy for cancellations', () => {
      const policy = getApplicablePolicy(0, true);
      expect(policy?.refundPercent).toBe(100);
      expect(policy?.label).toBe('Cancellation');
      expect(policy?.isCancellation).toBe(true);
    });
  });

  describe('getPolicyBreakdown', () => {
    test('should return all policy rules', () => {
      const breakdown = getPolicyBreakdown();
      expect(breakdown).toHaveLength(4);
      
      expect(breakdown[0]).toEqual({
        label: '0–2h59',
        refundPercent: 0,
        description: 'No refund'
      });
      
      expect(breakdown[1]).toEqual({
        label: '≥ 3h',
        refundPercent: 20,
        description: '20% instant refund'
      });
      
      expect(breakdown[2]).toEqual({
        label: '≥ 24h',
        refundPercent: 50,
        description: '50% instant refund'
      });
      
      expect(breakdown[3]).toEqual({
        label: 'Cancellation',
        refundPercent: 100,
        description: '100% instant refund'
      });
    });
  });

  describe('Real-world scenarios', () => {
    test('Scenario 1: Flight delayed 45 minutes - no refund', () => {
      const ticketPrice = BigInt('200000000000000000000'); // 200 C2FLR
      const result = calculateRefundWei(ticketPrice, 45, false);
      
      expect(result.refundPercent).toBe(0);
      expect(result.refundAmountWei).toBe(BigInt(0));
    });

    test('Scenario 2: Flight delayed 5 hours - 20% refund', () => {
      const ticketPrice = BigInt('200000000000000000000'); // 200 C2FLR
      const result = calculateRefundWei(ticketPrice, 300, false); // 5 hours
      
      expect(result.refundPercent).toBe(20);
      expect(result.refundAmountWei).toBe(BigInt('40000000000000000000')); // 40 C2FLR
    });

    test('Scenario 3: Flight delayed 30 hours - 50% refund', () => {
      const ticketPrice = BigInt('150000000000000000000'); // 150 C2FLR
      const result = calculateRefundWei(ticketPrice, 1800, false); // 30 hours
      
      expect(result.refundPercent).toBe(50);
      expect(result.refundAmountWei).toBe(BigInt('75000000000000000000')); // 75 C2FLR
    });

    test('Scenario 4: Flight cancelled - 100% refund', () => {
      const ticketPrice = BigInt('250000000000000000000'); // 250 C2FLR
      const result = calculateRefundWei(ticketPrice, 0, true);
      
      expect(result.refundPercent).toBe(100);
      expect(result.refundAmountWei).toBe(ticketPrice); // 250 C2FLR
    });

    test('Scenario 5: Edge case - exactly 3 hours delay', () => {
      const ticketPrice = BigInt('100000000000000000000'); // 100 C2FLR
      const result = calculateRefundWei(ticketPrice, 180, false);
      
      expect(result.refundPercent).toBe(20);
      expect(result.refundAmountWei).toBe(BigInt('20000000000000000000')); // 20 C2FLR
    });

    test('Scenario 6: Edge case - exactly 24 hours delay', () => {
      const ticketPrice = BigInt('100000000000000000000'); // 100 C2FLR
      const result = calculateRefundWei(ticketPrice, 1440, false);
      
      expect(result.refundPercent).toBe(50);
      expect(result.refundAmountWei).toBe(BigInt('50000000000000000000')); // 50 C2FLR
    });
  });

  describe('Fixed policy immutability', () => {
    test('should always return the same percentages', () => {
      // These values should never change regardless of user input or context
      expect(getRefundPercent(100, false)).toBe(0);
      expect(getRefundPercent(180, false)).toBe(20);
      expect(getRefundPercent(1440, false)).toBe(50);
      expect(getRefundPercent(0, true)).toBe(100);
      
      // Call multiple times to ensure consistency
      for (let i = 0; i < 100; i++) {
        expect(getRefundPercent(300, false)).toBe(20);
      }
    });
  });
});
