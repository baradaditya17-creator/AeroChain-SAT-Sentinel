import { NextRequest, NextResponse } from 'next/server';
import { simulatorStore } from '@/lib/simulator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'PLAY':
        simulatorStore.updateSettings({ isPlaying: true });
        simulatorStore.addLog('PLAYBACK_START', 'Telemetry feed resumed by Mission Commander.', 'Operator-Active');
        break;
      case 'PAUSE':
        simulatorStore.updateSettings({ isPlaying: false });
        simulatorStore.addLog('PLAYBACK_PAUSE', 'Telemetry feed paused for detailed inspection.', 'Operator-Active');
        break;
      case 'CHANGE_SCENARIO':
        if (payload?.scenario) {
          simulatorStore.changeScenario(payload.scenario);
        }
        break;
      case 'UPDATE_SETTINGS':
        if (payload?.settings) {
          simulatorStore.updateSettings(payload.settings);
        }
        break;
      case 'ACK_ALERT':
        if (payload?.id) {
          simulatorStore.acknowledgeAlert(payload.id);
        }
        break;
      case 'RESOLVE_ALERT':
        if (payload?.id) {
          simulatorStore.resolveAlert(payload.id);
        }
        break;
      case 'CLEAR_ALERTS':
        simulatorStore.clearAllAlerts();
        break;
      case 'APPROVE_DECISION':
        if (payload?.id) {
          simulatorStore.approveDecision(payload.id);
        }
        break;
      case 'VETO_DECISION':
        if (payload?.id) {
          simulatorStore.vetoDecision(payload.id);
        }
        break;
      case 'CHANGE_AGENT_POLICY':
        if (payload?.id && payload?.autonomyLevel) {
          simulatorStore.changeAgentPolicy(payload.id, payload.autonomyLevel);
        }
        break;
      case 'ANCHOR_BATCH':
        const anchor = simulatorStore.anchorBatch();
        return NextResponse.json({ success: true, anchor });
      case 'ADD_LOG':
        if (payload?.action && payload?.details) {
          simulatorStore.addLog(payload.action, payload.details, payload?.operator || 'Operator-Active');
        }
        break;
      default:
        return NextResponse.json({ error: 'Unknown simulation control action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: simulatorStore.getState() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Control operation failed' }, { status: 500 });
  }
}
