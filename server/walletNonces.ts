// Armazenamento temporário de nonces para autenticação por carteira
// Em produção, usar Redis ou banco de dados

interface WalletNonce {
  nonce: string;
  createdAt: number;
}

const walletNonces: Map<string, WalletNonce> = new Map();

export function setNonce(address: string, nonce: string): void {
  const key = `nonce:${address.toLowerCase()}`;
  walletNonces.set(key, { nonce, createdAt: Date.now() });
}

export function getNonce(address: string): WalletNonce | undefined {
  const key = `nonce:${address.toLowerCase()}`;
  return walletNonces.get(key);
}

export function deleteNonce(address: string): void {
  const key = `nonce:${address.toLowerCase()}`;
  walletNonces.delete(key);
}

export function isNonceValid(address: string, nonce: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const stored = getNonce(address);
  if (!stored) return false;
  if (stored.nonce !== nonce) return false;
  if (Date.now() - stored.createdAt > maxAgeMs) {
    deleteNonce(address);
    return false;
  }
  return true;
}
