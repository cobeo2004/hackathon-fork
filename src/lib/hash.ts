// Tiny deterministic hash for the append-only passport event chain.
// Not cryptographic — it stands in for the blockchain anchoring that is out of
// scope for the MVP, while still demonstrating tamper-evident chaining.

export function shortHash(input: string): string {
  // FNV-1a 32-bit, rendered as 8 hex chars.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
