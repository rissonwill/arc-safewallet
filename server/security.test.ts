import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("contract.getCompilerVersions", () => {
  it("returns list of supported compiler versions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const versions = await caller.contract.getCompilerVersions();

    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0]).toMatch(/^v\d+\.\d+\.\d+/);
  });
});

describe("contract.getVerificationNetworks", () => {
  it("returns list of networks that support verification", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const networks = await caller.contract.getVerificationNetworks();

    expect(Array.isArray(networks)).toBe(true);
    expect(networks.length).toBeGreaterThan(0);
    
    // Check structure
    const network = networks[0];
    expect(network).toHaveProperty("chainId");
    expect(network).toHaveProperty("name");
    expect(network).toHaveProperty("explorer");
  });
});

describe("template.list from security", () => {
  it("returns contract templates as array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.template.list();

    // Templates are returned from database, may be empty if not seeded
    expect(Array.isArray(templates)).toBe(true);
    
    // If templates exist, check structure
    if (templates.length > 0) {
      const template = templates[0];
      expect(template).toHaveProperty("id");
      expect(template).toHaveProperty("name");
      expect(template).toHaveProperty("templateType");
    }
  });
});
