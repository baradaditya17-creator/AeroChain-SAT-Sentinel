'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Send, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface AgentCockpitProps {
  scenario: string;
  onScenarioChange: (scenario: string) => void;
  onLogAdd: (log: string) => void;
}

export default function AgentCockpit({ scenario, onScenarioChange, onLogAdd }: AgentCockpitProps) {
  const [command, setCommand] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [copilotReply, setCopilotReply] = useState<string | null>(
    'Systems online. I am Saturn Aerospace Copilot. Ready to analyze cyber threat vectors and orbital telemetries.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const userCmd = command;
    setCommand('');
    onLogAdd(`USER_CMD: ${userCmd}`);
    setIsQuerying(true);

    try {
      // Send command query to server-side Gemini Proxy endpoint
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are Saturn Aerospace Copilot. The current security alert status is ${scenario}. The user asks: "${userCmd}". Respond with a short, tactical 2-sentence orbital cyber-defense brief.` 
        }),
      });
      const data = await res.json();
      if (data.text) {
        setCopilotReply(data.text);
        onLogAdd(`COPILOT: ${data.text.slice(0, 70)}...`);
      } else {
        setCopilotReply('Unable to contact terminal AI link. Operating on localized fallback schemas.');
      }
    } catch (err) {
      setCopilotReply('Link error. Check server status logs.');
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#030712]/85 border border-slate-800 backdrop-blur-md rounded-xl p-4 overflow-hidden">
      {/* Cockpit Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          Tactical Mission Scenario Switcher
        </h3>
        <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full font-mono">
          ALERT_LEVEL: {scenario}
        </span>
      </div>

      {/* Switch Alert Status buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {[
          { key: 'SECURE', label: 'SECURE', bg: 'hover:bg-emerald-950/30 hover:border-emerald-500/50', active: 'bg-emerald-950/40 border-emerald-500 text-emerald-400' },
          { key: 'DEGRADED', label: 'DEGRADED', bg: 'hover:bg-amber-950/30 hover:border-amber-500/50', active: 'bg-amber-950/40 border-amber-500 text-amber-400' },
          { key: 'TAMPERING', label: 'TAMPERING', bg: 'hover:bg-orange-950/30 hover:border-orange-500/50', active: 'bg-orange-950/40 border-orange-500 text-orange-400' },
          { key: 'ATTACK', label: 'ATTACK', bg: 'hover:bg-red-950/30 hover:border-red-500/50', active: 'bg-red-950/40 border-red-500 text-red-400' },
        ].map((s) => {
          const isActive = scenario === s.key;
          return (
            <button
              key={s.key}
              onClick={() => {
                onScenarioChange(s.key);
                onLogAdd(`SYS_ALERT_FLIP: Alert level set to ${s.key}`);
              }}
              className={`border border-slate-800 text-[11px] font-mono font-semibold py-2 rounded-lg transition-all ${
                isActive ? s.active : `bg-[#090d16] text-slate-400 ${s.bg}`
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Copilot Interface Console */}
      <div className="flex-1 bg-[#090d16] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between min-h-[140px] mb-4">
        <div className="text-[11px] font-mono leading-relaxed overflow-y-auto max-h-[160px] text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
            <span>[CO-PILOT LINK ACTIVE]</span>
          </div>
          {copilotReply ? (
            <p className="text-slate-300">{copilotReply}</p>
          ) : (
            <p className="text-slate-500 italic">Query terminal to receive telemetry brief...</p>
          )}
        </div>

        {isQuerying && (
          <div className="text-[10px] font-mono text-cyan-400/80 animate-pulse mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Connecting deep space orbital relay network...
          </div>
        )}
      </div>

      {/* Terminal input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Ask copilot to analyze defense vectors..."
          disabled={isQuerying}
          className="flex-1 bg-[#090d16] border border-slate-800 text-xs text-slate-100 placeholder-slate-600 px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={isQuerying || !command.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold px-3 py-2 rounded-lg transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
