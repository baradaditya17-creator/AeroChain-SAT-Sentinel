import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { alert } = await req.json();
    if (!alert) {
      return NextResponse.json({ error: 'Alert payload is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // High-Fidelity local aerospace cybersecurity fallback to guarantee instant presentation
      const localAnalyses: Record<string, any> = {
        'GPS_SPOOFING': {
          riskScore: 97,
          summary: 'CRITICAL WARNING: The drone trajectory diverges from inertial estimates. Calculated GPS signals indicate high probability of coordinate injection (GPS Spoofing).',
          explanation: 'The drone telemetry shows rapid change in coordinates without corresponding acceleration vectors in IMU pitch/roll sensors. This is a characteristic indicator of false RF signals mimicking legitimate GPS satellites, causing path deflection.',
          mitigation: '1. Command immediate switch to Inertial Navigation System (INS).\n2. Initiate Return-to-Home (RTH) protocol using magnetic compass vector alignment.\n3. Log incident in decentralized blockchain ledger to prevent telemetry alteration.',
          attackConfidence: 0.96
        },
        'TELEMETRY_TAMPERING': {
          riskScore: 94,
          summary: 'CRITICAL ALERT: Digital signature validation mismatch detected. Payload values altered in transit.',
          explanation: 'The received telemetry packet contains an invalid signature hash. Re-evaluation of the telemetry fields (altitude, speed) indicates data was modified after generation. This points to intermediate satellite link interception (Man-in-the-Middle attack).',
          mitigation: '1. Discard current telemetry frames.\n2. Force session re-handshake with rotated Ed25519 signing keys.\n3. Request re-transmission of lost frames via secured alternate orbital pass window.',
          attackConfidence: 0.98
        },
        'REPLAY_ATTACK': {
          riskScore: 88,
          summary: 'SECURITY ALERT: Stale telemetry sequence numbers detected. Replay attempt verified.',
          explanation: 'The telemetry feed sequence numbers do not match expected sequential increments, and timestamps represent frames sent in previous intervals. This is a replay anomaly designed to hide the drone\'s actual flight status.',
          mitigation: '1. Enable strict timestamp challenge-response validations.\n2. Filter out stale frames and trigger network link sequence reset.\n3. Alert ground operator of potential control-link compromise.',
          attackConfidence: 0.92
        },
        'SIGNAL_JAMMING': {
          riskScore: 72,
          summary: 'OPERATIONAL ALERT: Severe L-Band RF Jamming or signal attenuation detected.',
          explanation: 'Signal-to-Noise ratio (SNR) decreased by 14dB while telemetry delay spiked to 450ms with 38% packet loss. This indicates a high-intensity RF interference event jamming the satellite receiver uplink.',
          mitigation: '1. Activate spread-spectrum frequency hopping.\n2. Compress telemetry payload sizes to minimize required bandwidth.\n3. Fall back to low-frequency line-of-sight UHF link if available.',
          attackConfidence: 0.84
        },
        'SIGNATURE_STRIPPING': {
          riskScore: 99,
          summary: 'CRITICAL AUDIT EXCEPTION: Telemetry packet received with stripped credentials.',
          explanation: 'A telemetry frame arrived entirely void of signature and hash values. This is an active intrusion bypass technique trying to feed unauthenticated telemetry data into the dashboard database.',
          mitigation: '1. Block all unauthenticated telemetry feeds.\n2. Lock simulation controls and issue secondary cryptographic query challenge.\n3. Log alert on-chain for forensic evidence trail.',
          attackConfidence: 1.00
        }
      };

      const type = alert.type || 'GPS_SPOOFING';
      const analysis = localAnalyses[type] || {
        riskScore: alert.anomalyScore * 100,
        summary: `AI Security Warning: Detected potential anomaly of type [${type}].`,
        explanation: 'Detailed telemetry parameter analysis suggests statistical deviation from standard flight dynamics. Cross-evaluation of satellite SNR and sequence logs flags potential risk.',
        mitigation: '1. Monitor link SNR and packet loss metrics closely.\n2. Cross-verify packet integrity hash with the anchored blockchain transaction logs.',
        attackConfidence: alert.confidence
      };

      return NextResponse.json({
        analysis,
        source: 'AeroChain-SAT Cybersecurity Local Guard Engine (Demo Fallback)',
      });
    }

    // Call standard Gemini 3.8-flash using the official SDK
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
You are the AeroChain-SAT Sentinel cyber forensics advisor. 
Analyse this drone telemetry threat alert and generate a detailed cyber forensic analysis in clean JSON format.

Alert details:
- Type: ${alert.type}
- Message: ${alert.message}
- Severity: ${alert.severity}
- Affected Features: ${JSON.stringify(alert.affectedFeatures)}
- Anomaly Score: ${alert.anomalyScore}
- Confidence: ${alert.confidence}

Respond ONLY with a JSON object of this structure:
{
  "riskScore": number (1-100),
  "summary": "Short 1-2 sentence high-level executive summary.",
  "explanation": "Detailed professional analysis explaining exactly how this attack or anomaly occurs, referencing drone sensors (GPS, IMU, compass), satellite link budgets, or cryptographic signatures.",
  "mitigation": "Numbered step-by-step instructions for the mission operator to resolve, suppress, or mitigate this threat immediately.",
  "attackConfidence": number (0.0 to 1.0)
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '';
    const parsedResult = JSON.parse(resultText.trim());

    return NextResponse.json({
      analysis: parsedResult,
      source: 'AeroChain-SAT AI Security Core (Gemini-3.8-Flash)',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gemini forensic analysis failed' }, { status: 500 });
  }
}
