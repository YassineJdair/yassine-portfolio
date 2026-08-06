import { describe, expect, it } from "vitest";
import { calcTax } from "./salaryTax";

describe("calcTax", () => {
    it("returns zero deductions for zero gross income", () => {
        const result = calcTax(0, "single", 0);
        expect(result.incomeTax).toBe(0);
        expect(result.usc).toBe(0);
        expect(result.prsi).toBe(0);
        expect(result.net).toBe(0);
    });

    it("exempts USC below the 13,000 threshold", () => {
        const result = calcTax(12000, "single", 0);
        expect(result.usc).toBe(0);
    });

    it("charges no PRSI at or below the 18,304 threshold", () => {
        const result = calcTax(18000, "single", 0);
        expect(result.prsi).toBe(0);
    });

    it("charges 4% PRSI above the threshold", () => {
        const result = calcTax(20000, "single", 0);
        expect(result.prsi).toBeCloseTo(20000 * 0.04, 5);
    });

    it("reduces taxable income by the pension contribution", () => {
        const withoutPension = calcTax(50000, "single", 0);
        const withPension = calcTax(50000, "single", 10);
        expect(withPension.totalDeductions).toBeGreaterThan(withoutPension.incomeTax + withoutPension.usc + withoutPension.prsi);
        expect(withPension.net).toBeLessThan(withoutPension.net);
    });

    it("gives married status a higher standard-rate cutoff than single", () => {
        const single = calcTax(60000, "single", 0);
        const married = calcTax(60000, "married", 0);
        expect(married.incomeTax).toBeLessThan(single.incomeTax);
    });

    it("keeps net + totalDeductions equal to gross", () => {
        const result = calcTax(75000, "single", 5);
        expect(result.net + result.totalDeductions).toBeCloseTo(result.gross, 5);
    });
});
