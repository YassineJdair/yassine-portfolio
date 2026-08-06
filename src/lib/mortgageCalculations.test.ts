import { describe, expect, it } from "vitest";
import {
    calcMonthlyRepayment,
    calcHelpToBuy,
    calcFirstHomeScheme,
    calcLocalAuthorityHomeLoan,
    calcMortgage,
    type MortgageInput,
} from "./mortgageCalculations";

const baseInput: MortgageInput = {
    propertyPrice: 300_000,
    deposit: 30_000,
    buyerType: "first-time",
    isJoint: false,
    income1: 60_000,
    income2: 0,
    interestRate: 4,
    termYears: 30,
    isNewBuild: true,
    isFreshStart: false,
    combineHtbWithFhs: false,
};

describe("calcMonthlyRepayment", () => {
    it("returns 0 for a zero principal", () => {
        expect(calcMonthlyRepayment(0, 4, 30)).toBe(0);
    });

    it("splits principal evenly across the term at 0% interest", () => {
        expect(calcMonthlyRepayment(120_000, 0, 10)).toBeCloseTo(1000, 5);
    });

    it("matches the standard amortization formula", () => {
        // Known reference value for €270,000 @ 4% over 30 years
        expect(calcMonthlyRepayment(270_000, 4, 30)).toBeCloseTo(1289.03, 1);
    });
});

describe("calcMortgage", () => {
    it("caps borrowing by the LTI multiplier for first-time buyers", () => {
        const result = calcMortgage({ ...baseInput, income1: 50_000, propertyPrice: 400_000, deposit: 40_000 });
        expect(result.maxLoanByLTI).toBe(50_000 * 4);
    });

    it("uses a 3.5x LTI multiplier for second-time buyers", () => {
        const result = calcMortgage({ ...baseInput, buyerType: "second-time", income1: 50_000 });
        expect(result.maxLoanByLTI).toBe(50_000 * 3.5);
    });

    it("combines both incomes when joint", () => {
        const result = calcMortgage({ ...baseInput, isJoint: true, income1: 50_000, income2: 40_000 });
        expect(result.combinedIncome).toBe(90_000);
    });

    it("ignores the second income when not joint", () => {
        const result = calcMortgage({ ...baseInput, isJoint: false, income1: 50_000, income2: 40_000 });
        expect(result.combinedIncome).toBe(50_000);
    });

    it("caps the max loan at 90% LTV even with high income", () => {
        const result = calcMortgage({ ...baseInput, income1: 1_000_000, propertyPrice: 300_000 });
        expect(result.maxLoanByLTV).toBe(270_000);
        expect(result.maxLoan).toBe(270_000);
    });

    it("flags as unaffordable when the required loan exceeds the max loan", () => {
        const result = calcMortgage({ ...baseInput, income1: 20_000, propertyPrice: 400_000, deposit: 10_000 });
        expect(result.isAffordable).toBe(false);
    });

    it("flags as affordable when the required loan is within both caps", () => {
        const result = calcMortgage({ ...baseInput, income1: 80_000, propertyPrice: 300_000, deposit: 30_000 });
        expect(result.isAffordable).toBe(true);
    });
});

describe("calcHelpToBuy", () => {
    it("is eligible for a first-time buyer purchasing a new build under the price ceiling", () => {
        const result = calcHelpToBuy(baseInput);
        expect(result.eligible).toBe(true);
        expect(result.amount).toBe(30_000);
    });

    it("caps the amount at 10% of the purchase price when that is lower than €30,000", () => {
        const result = calcHelpToBuy({ ...baseInput, propertyPrice: 200_000 });
        expect(result.amount).toBe(20_000);
    });

    it("is ineligible for second-time buyers", () => {
        const result = calcHelpToBuy({ ...baseInput, buyerType: "second-time" });
        expect(result.eligible).toBe(false);
        expect(result.reasons.length).toBeGreaterThan(0);
    });

    it("is ineligible for second-hand properties", () => {
        const result = calcHelpToBuy({ ...baseInput, isNewBuild: false });
        expect(result.eligible).toBe(false);
    });

    it("is ineligible above the €500,000 ceiling", () => {
        const result = calcHelpToBuy({ ...baseInput, propertyPrice: 550_000 });
        expect(result.eligible).toBe(false);
    });
});

describe("calcFirstHomeScheme", () => {
    it("allows up to 30% equity when not combined with Help to Buy", () => {
        const result = calcFirstHomeScheme(baseInput, 10);
        expect(result.eligible).toBe(true);
        expect(result.maxEquity).toBe(300_000 * 0.3);
    });

    it("caps equity at 20% when combined with Help to Buy", () => {
        const result = calcFirstHomeScheme({ ...baseInput, combineHtbWithFhs: true }, 10);
        expect(result.maxEquity).toBe(300_000 * 0.2);
    });

    it("is ineligible below a 10% deposit", () => {
        const result = calcFirstHomeScheme(baseInput, 5);
        expect(result.eligible).toBe(false);
    });

    it("allows Fresh Start applicants who are not first-time buyers", () => {
        const result = calcFirstHomeScheme({ ...baseInput, buyerType: "second-time", isFreshStart: true }, 10);
        expect(result.eligible).toBe(true);
    });
});

describe("calcLocalAuthorityHomeLoan", () => {
    it("is eligible for a single first-time buyer under the income limit", () => {
        const result = calcLocalAuthorityHomeLoan(baseInput, 60_000);
        expect(result.eligible).toBe(true);
    });

    it("is ineligible when single income exceeds €80,000", () => {
        const result = calcLocalAuthorityHomeLoan(baseInput, 90_000);
        expect(result.eligible).toBe(false);
    });

    it("uses the higher €85,000 limit for joint applicants", () => {
        const result = calcLocalAuthorityHomeLoan({ ...baseInput, isJoint: true }, 82_000);
        expect(result.eligible).toBe(true);
    });
});
