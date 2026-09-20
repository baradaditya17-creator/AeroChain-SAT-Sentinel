'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Cpu, Wifi, HardDrive, ShieldAlert, CheckCircle } from 'lucide-react';

interface SpaceVisualizerProps {
  scenario?: string;
}

export default function SpaceVisualizer({ scenario = 'SECURE' }: SpaceVisualizerProps) {
  // Generate mock telemetry data matching cyber scenario
  const telemetryData = useMemo(() => {
    const isThreat = scenario === 'ATTACK' || scenario === 'TAMPERING';
    const isDegraded = scenario === 'DEGRADED';
    
    return Array.from({ length: 12 }).map((_, idx) => {
      let traffic = 200 + Math.sin(idx * 0.8) * 50 + Math.random() * 20;
      let anomalies = Math.random() * 5;

      if (isThreat) {
        traffic += 180 + Math.random() * 80;
        anomalies += 35 + Math.random() * 25;
      } else if (isDegraded) {
        traffic -= 80;
        anomalies += 10 + Math.random() * 8;
      }

      return {
        time: `${idx * 5}m`,
        bandwidth: Math.round(traffic),
        anomalies: Math.round(anomalies),
      };
    });
  }, [scenario]);

  const metrics = useMemo(() => {
    const isThreat = scenario === 'ATTACK' || scenario === 'TAMPERING';
    const isDegraded = scenario === 'DEGRADED';

    return [
      {
        id: 'bandwidth',
        name: 'Transceiver Bandwidth',
        value: isThreat ? '842 Mbps' : isDegraded ? '184 Mbps' : '482 Mbps',
        status: isThreat ? 'CRITICAL' : isDegraded ? 'DEGRADED' : 'NOMINAL',
        color: isThreat ? 'text-red-500' : isDegraded ? 'text-amber-500' : 'text-cyan-400',
        icon: Wifi,
      },
      {
        id: 'cpu',
        name: 'Copilot AI Load',
        value: isThreat ? '94%' : isDegraded ? '71%' : '38%',
        status: isThreat ? 'CRITICAL' : isDegraded ? 'NOMINAL' : 'NOMINAL',
        color: isThreat ? 'text-red-500' : 'text-emerald-400',
        icon: Cpu,
      },
      {
        id: 'firewall',
        name: 'Filter Engine',
        value: isThreat ? 'ACTIVE BLOCKED' : 'NOMINAL',
        status: isThreat ? 'CRITICAL' : 'NOMINAL',
        color: isThreat ? 'text-red-500' : 'text-emerald-400',
        icon: HardDrive,
      },
    ];
  }, [scenario]);

  return (
    <div className="flex flex-col h-full bg-[#030712]/85 border border-slate-800 backdrop-blur-md rounded-xl p-4 overflow-hidden">
      {/* Visualizer Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          Real-time System Telemetry & Flow
        </h3>
        <span className="text-[10px] font-mono text-slate-500">SYS_V.1.09</span>
      </div>

      {/* Grid of Micro Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div 
              key={m.id} 
              className="bg-[#090d16] border border-slate-800/80 rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-mono">{m.name}</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">{m.value}</span>
              </div>
              <div className={`p-1.5 rounded-md bg-slate-900 ${m.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={telemetryData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area 
              type="monotone" 
              dataKey="bandwidth" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#colorBandwidth)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="anomalies" 
              stroke="#f43f5e" 
              fillOpacity={1} 
              fill="url(#colorAnomalies)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Security Status summary */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          {scenario === 'SECURE' ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-400">Security Ring Secured</span>
            </>
          ) : (
            <>
              <ShieldAlert className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
              <span className="text-rose-400">Subsystem Warning Raised</span>
            </>
          )}
        </span>
        <span>Threat Index: {scenario === 'ATTACK' ? '92%' : scenario === 'TAMPERING' ? '68%' : '4%'}</span>
      </div>
    </div>
  );
}
