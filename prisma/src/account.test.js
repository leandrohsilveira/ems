import { describe, it, expect } from "vitest";
import { AccountType } from "./gen/enums.js";

describe("AccountType", () => {
  it("should have BANK value", () => {
    expect(AccountType.BANK).toBe("BANK");
  });
});


