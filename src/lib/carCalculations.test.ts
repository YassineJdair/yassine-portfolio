import { describe, expect, it } from "vitest";
import { getTaxBand, computeFuelCost, CO2_BANDS } from "./carCalculations";

describe("getTaxBand", () => {
    it("returns the electric band regardless of co2 when isElectric is true", () => {
        expect(getTaxBand(150, true)).toBe(CO2_BANDS[0]);
    });

    it("returns the matching band for a given co2 value", () => {
        expect(getTaxBand(90, false).label).toBe("A1 (81–100g/km)");
    });

    it("falls back to the top band for very high emissions", () => {
        expect(getTaxBand(500, false)).toBe(CO2_BANDS[CO2_BANDS.length - 1]);
    });
});

describe("computeFuelCost", () => {
    it("computes cost for km + L/100km inputs", () => {
        const result = computeFuelCost(100, "km", 6, "L/100km", 1.75);
        expect(result.litresUsed).toBeCloseTo(6, 5);
        expect(result.fuelCost).toBeCloseTo(10.5, 5);
        expect(result.costPer100km).toBeCloseTo(10.5, 5);
    });

    it("converts miles to km before computing cost", () => {
        const km = computeFuelCost(62.1371, "km", 6, "L/100km", 1.75);
        const miles = computeFuelCost(38.6, "miles", 6, "L/100km", 1.75);
        expect(miles.fuelCost).toBeCloseTo(km.fuelCost, 1);
    });

    it("converts mpg to L/100km before computing cost", () => {
        const result = computeFuelCost(100, "km", 47.08, "mpg", 1.75);
        expect(result.litresUsed).toBeCloseTo(6, 1);
    });
});
