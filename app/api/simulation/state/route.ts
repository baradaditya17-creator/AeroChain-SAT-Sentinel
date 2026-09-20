import { NextResponse } from 'next/server';
import { simulatorStore } from '@/lib/simulator';

// Force dynamic execution to prevent static optimization
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform a background simulation step to make state advance when client calls
    if (simulatorStore.getState().isPlaying) {
      simulatorStore.tick();
    }
    const state = simulatorStore.getState();
    return NextResponse.json(state);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch simulation state' }, { status: 500 });
  }
}
