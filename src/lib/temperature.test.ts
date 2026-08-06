import { describe, expect, it } from "vitest";
import { celsiusToFahrenheit, fahrenheitToCelsius } from "./temperature";

describe("temperature conversions", () => {
    it("converts freezing point correctly", () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
        expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it("converts boiling point correctly", () => {
        expect(celsiusToFahrenheit(100)).toBe(212);
        expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it("round-trips a value", () => {
        const original = 37;
        expect(fahrenheitToCelsius(celsiusToFahrenheit(original))).toBeCloseTo(original, 10);
    });

    it("handles negative temperatures", () => {
        expect(celsiusToFahrenheit(-40)).toBe(-40);
        expect(fahrenheitToCelsius(-40)).toBe(-40);
    });
});
