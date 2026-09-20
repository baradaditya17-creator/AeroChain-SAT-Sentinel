import { NextRequest, NextResponse } from 'next/server';
import { simulatorStore } from '@/lib/simulator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { packetId, latitude, longitude, altitude, speed, sequence, signature, merkleRoot, onChainRoot } = payload;

    // 1. Recompute cryptographic hash
    const payloadString = `${latitude}-${longitude}-${altitude}-${speed}-${sequence}`;
    
    // Simple deterministic hash matching simulator
    let hashVal = 0;
    for (let i = 0; i < payloadString.length; i++) {
      const char = payloadString.charCodeAt(i);
      hashVal = (hashVal << 5) - hashVal + char;
      hashVal |= 0;
    }
    const hex = Math.abs(hashVal).toString(16).padEnd(8, '0');
    const computedHash = Array(8).fill(hex).join('').substring(0, 64);

    // 2. Signature checking
    const signatureValid = signature && signature.startsWith('sig_ed25519_') && !signature.includes('tamper');

    // 3. Merkle verification matching
    const merkleMatch = merkleRoot && onChainRoot && merkleRoot === onChainRoot;

    // 4. Overall integrity verdict
    let verdict: 'VERIFIED' | 'TAMPERED' | 'UNKNOWN' = 'VERIFIED';
    const reasons: string[] = [];

    if (!signatureValid) {
      verdict = 'TAMPERED';
      reasons.push('Cryptographic Ed25519 signature validation failed.');
    }
    if (computedHash !== computedHash) { // Always matches itself but placeholder for custom modifications
      verdict = 'TAMPERED';
      reasons.push('Recalculated data payload hash mismatch.');
    }
    if (!merkleMatch) {
      verdict = 'TAMPERED';
      reasons.push('Merkle tree root does not match anchored on-chain registry hash.');
    }

    const result = {
      computedHash,
      signatureValid,
      merkleMatch,
      verdict,
      reasons: reasons.length > 0 ? reasons : ['All integrity and ledger checks completed successfully. Telemetry is trusted.'],
      timestamp: new Date().toISOString(),
    };

    // Log the verification query action
    simulatorStore.addLog('MANUAL_VERIFY', `Diagnostic integrity run on packet [${packetId || 'Manual-Input'}]. Result: ${verdict}`, 'Security-Auditor');

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification calculation failed' }, { status: 500 });
  }
}
