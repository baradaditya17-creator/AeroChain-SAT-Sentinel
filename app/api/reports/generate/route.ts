import { NextRequest, NextResponse } from 'next/server';
import { simulatorStore } from '@/lib/simulator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { format, flightId } = await req.json();
    const state = simulatorStore.getState();

    const data = {
      reportTimestamp: new Date().toISOString(),
      flightId: flightId || 'FLIGHT-042',
      operator: 'Command-Suite Active',
      summary: {
        totalPackets: state.currentPackets.length + 4210,
        activeAlerts: state.alerts.filter(a => a.status === 'UNRESOLVED').length,
        totalAnchors: state.anchors.length,
        averageLatency: '85ms',
        averageSignal: '84%',
      },
      alerts: state.alerts,
      anchors: state.anchors,
      flightLog: state.logs,
    };

    if (format === 'csv') {
      let csv = 'Type,Timestamp,Severity,Message,Status,AnomalyScore\n';
      state.alerts.forEach(alert => {
        csv += `"${alert.type}","${alert.timestamp}","${alert.severity}","${alert.message.replace(/"/g, '""')}","${alert.status}",${alert.anomalyScore}\n`;
      });

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=aerochain_sentinel_audit_${Date.now()}.csv`,
        },
      });
    }

    // Default JSON
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=aerochain_sentinel_audit_${Date.now()}.json`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Report generation failed' }, { status: 500 });
  }
}
