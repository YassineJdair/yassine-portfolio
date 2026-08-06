import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("returns the initial value when nothing is stored", () => {
        const { result } = renderHook(() => useLocalStorage("key", "default"));
        expect(result.current[0]).toBe("default");
    });

    it("reads an existing value from localStorage", () => {
        localStorage.setItem("key", JSON.stringify("stored"));
        const { result } = renderHook(() => useLocalStorage("key", "default"));
        expect(result.current[0]).toBe("stored");
    });

    it("persists updates to localStorage", () => {
        const { result } = renderHook(() => useLocalStorage("key", "default"));

        act(() => {
            result.current[1]("updated");
        });

        expect(result.current[0]).toBe("updated");
        expect(localStorage.getItem("key")).toBe(JSON.stringify("updated"));
    });

    it("falls back to the initial value when stored JSON is invalid", () => {
        localStorage.setItem("key", "{not json");
        const { result } = renderHook(() => useLocalStorage("key", "default"));
        expect(result.current[0]).toBe("default");
    });
});
