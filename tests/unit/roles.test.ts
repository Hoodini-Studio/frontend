import { describe, expect, it } from "vitest";
import { getHomePathForUser, getPostAuthPath, isAdmin } from "@/lib/auth/roles";
import { adminUser, customerUser } from "../../e2e/fixtures/data";

describe("auth roles", () => {
  it("detects admin role", () => {
    expect(isAdmin(adminUser)).toBe(true);
    expect(isAdmin(customerUser)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it("routes users after auth", () => {
    expect(getPostAuthPath(adminUser)).toBe("/admin/dashboard");
    expect(getPostAuthPath(customerUser)).toBe("/");
    expect(getHomePathForUser(adminUser)).toBe("/admin/dashboard");
    expect(getHomePathForUser(null)).toBe("/");
  });
});
