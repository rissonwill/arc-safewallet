import { describe, expect, it } from "vitest";
import { ethers } from "ethers";

describe("Private Key Validation", () => {
  it("should have PRIVATE_KEY environment variable set", () => {
    const privateKey = process.env.PRIVATE_KEY;
    expect(privateKey).toBeDefined();
    expect(privateKey).not.toBe("");
    expect(privateKey).not.toBe("sua_chave_privada_aqui");
  });

  it("should be a valid Ethereum private key format", () => {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not set");
    }

    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
    
    // Should be 64 hex characters
    expect(cleanKey.length).toBe(64);
    expect(/^[a-fA-F0-9]+$/.test(cleanKey)).toBe(true);
  });

  it("should derive a valid Ethereum address from private key", () => {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not set");
    }

    // Add 0x prefix if not present
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(formattedKey);
    
    // Should derive a valid address
    expect(wallet.address).toBeDefined();
    expect(wallet.address.startsWith("0x")).toBe(true);
    expect(wallet.address.length).toBe(42);
    
    console.log("Derived wallet address:", wallet.address);
  });
});
