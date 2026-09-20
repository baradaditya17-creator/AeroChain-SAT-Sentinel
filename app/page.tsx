'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Activity, Wifi, Terminal, RefreshCw, Layers } from 'lucide-react';
import SaturnBackground from '../components/saturn-background';
import TacticalMap from '../components/tactical-map';
import SpaceVisualizer from '../components/space-visualizer';
import AgentCockpit from '../components/agent-cockpit';

export default function Home() {
  const [scenario, setScenario] = useState('SECURE');
  const [logs, setLogs] = useState<string[]>([
    'SYS_BOOT: Aerospace Command terminal active.',
    'NET_LINK: Saturn Deep Space telemetry synchronization complete.',
    'SECURE_RING: All orbital security defensive nodes are SECURE.'
  ]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 32)]);
  };

  // Add automated logs periodically matching threat level
  useEffect(() => {
    const interval = setInterval(() => {
      const activeMsgs = {
        SECURE: [
          'TEL_OK: High-gain antenna signal index stable.',
          'CRYPTO_OK: Enceladus link packets encrypted.',
          'ORBIT_OK: Sentinel orbital altitudes nominal.'
        ],
        DEGRADED: [
          'WARN_PING: Transient noise detected on Cryo-Link.',
          'SYS_LOAD: Subsystem telemetry packets lagging.',
          'POWER: Solar panel efficiency reduced to 88%.'
        ],
        TAMPERING: [
          'SYS_WARN: Unexpected payload hash signature.',
          'ONCHAIN: Security handshake challenge issued.',
          'DETECTOR: Anisotropic wave oscillation detected.'
        ],
        ATTACK: [
          'ALERT: Direct denial payload targeted at Titan Alpha!',
          'FIREWALL: Port scanning detected on local deflector hub.',
          'DEFENSE: Deflector energy shields activated!'
        ]
      }[scenario as 'SECURE' | 'DEGRADED' | 'TAMPERING' | 'ATTACK'] || [];

      const randomMsg = activeMsgs[Math.floor(Math.random() * activeMsgs.length)];
      addLog(randomMsg);
    }, 4500);

    return () => clearInterval(interval);
  }, [scenario]);

  return (
    <main className="relative min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Dynamic Cinematic 3D Saturn background */}
      <SaturnBackground scenario={scenario} />

      {/* Floating Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-500/30">
            <Layers className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide uppercase text-slate-100">
              Saturn Aerospace & Cyber Defense Station
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              ON-CHAIN ORBITAL SECURITY PROTOCOL
            </p>
          </div>
        </div>

        {/* Global Alert status banner */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[9px] text-slate-500 font-mono">ENCRYPTION PROTOCOL</span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">AES-256-GCM / SHA3</span>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            scenario === 'ATTACK'
              ? 'bg-red-950/50 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
              : scenario === 'TAMPERING'
                ? 'bg-orange-950/40 border-orange-500 text-orange-400'
                : scenario === 'DEGRADED'
                  ? 'bg-amber-950/30 border-amber-500 text-amber-400'
                  : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400'
          }`}>
            {scenario === 'ATTACK' ? (
              <ShieldAlert className="h-3.5 w-3.5 text-red-400 animate-bounce" />
            ) : (
              <Shield className="h-3.5 w-3.5" />
            )}
            <span>STATUS: {scenario}</span>
          </div>
        </div>
      </header>

      {/* Grid Dashboard Body */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-6 max-w-7xl mx-auto w-full">
        {/* Left column: Tactical orbital Map & Simulation state switcher (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Main Tactical orbital defense Map */}
          <div className="h-[400px]">
            <TacticalMap scenario={scenario} onAlertSelect={(msg) => addLog(`USER_ALERT: ${msg}`)} />
          </div>

          {/* Copilot terminal & Scenario switcher */}
          <div className="flex-1">
            <AgentCockpit scenario={scenario} onScenarioChange={setScenario} onLogAdd={addLog} />
          </div>
        </div>

        {/* Right column: Analytics charts & Real-time Console Logging (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Telemetry charts */}
          <div className="h-[300px]">
            <SpaceVisualizer scenario={scenario} />
          </div>

          {/* Real-time System Event Log terminal */}
          <div className="flex-1 bg-[#030712]/80 border border-slate-800 backdrop-blur-md rounded-xl p-4 flex flex-col overflow-hidden max-h-[340px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-semibold uppercase text-slate-300 flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                Live Orbital Log Console
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 uppercase font-bold"
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Clear
              </button>
            </div>

            {/* Scrollable logs */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <AnimatePresence initial={false}>
                {logs.length > 0 ? (
                  logs.map((log, idx) => {
                    let color = 'text-slate-400';
                    if (log.includes('ALERT') || log.includes('ATTACK')) color = 'text-red-400 font-semibold';
                    else if (log.includes('WARN') || log.includes('TAMPERING')) color = 'text-amber-400';
                    else if (log.includes('USER_CMD')) color = 'text-cyan-400';
                    else if (log.includes('COPILOT')) color = 'text-emerald-400';

                    return (
                      <motion.div
                        key={`${idx}-${log.slice(0, 10)}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${color} border-l border-slate-800 pl-2 py-0.5`}
                      >
                        {log}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-slate-600 italic py-4 text-center">No terminal logs recorded. Waiting for signal telemetry...</div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono gap-2 mt-6">
        <span>SECURITY LEVEL: ULTRA-SECURE // CO-PILOT LINK OK</span>
        <span>SATURN SYSTEM SECURITY CONTROL © 2026</span>
      </footer>
    </main>
  );
}
