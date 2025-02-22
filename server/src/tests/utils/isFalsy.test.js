import { describe, expect, test } from "vitest";
import isFalsy from "../../utils/isFalsy.js";

describe("isFalsy function", () => {
  test("returns true for falsy values", () => {
    expect(isFalsy("null")).toBe(true);
    expect(isFalsy("")).toBe(true);
    expect(isFalsy(false)).toBe(true);
    expect(isFalsy(0)).toBe(true);
    expect(isFalsy(undefined)).toBe(true);
    expect(isFalsy(NaN)).toBe(true);
  });

  test("returns false for truthy values", () => {
    expect(isFalsy("hello")).toBe(false);
    expect(isFalsy(42)).toBe(false);
    expect(isFalsy("true")).toBe(false);
  });
});