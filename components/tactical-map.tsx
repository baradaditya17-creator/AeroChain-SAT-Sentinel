'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Radio, ShieldAlert, Cpu, Orbit, CircleDot } from 'lucide-react';

interface TacticalMapProps {
  scenario?: string;
  onAlertSelect?: (msg: string) => void;
}

interface SignalPacket {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
  type: 'DATA' | 'THREAT' | 'ENCRYPTED';
}

interface ShieldNode {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'NOMINAL' | 'WARNING' | 'ALERT';
  uptime: string;
  integrity: number;
}

export default function TacticalMap({ scenario = 'SECURE', onAlertSelect }: TacticalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [packets, setPackets] = useState<SignalPacket[]>([]);
  const [selectedNode, setSelectedNode] = useState<ShieldNode | null>(null);

  // Responsive sizing using ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: width || 600, height: height || 400 });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 4 orbital security defense nodes distributed around space
  const nodes = useMemo<ShieldNode[]>(() => {
    const isDegraded = scenario === 'DEGRADED';
    const isAttacked = scenario === 'TAMPERING' || scenario === 'ATTACK';

    return [
      {
        id: 'TITAN-1',
        name: 'Titan Alpha Sentinel',
        x: 0.25,
        y: 0.3,
        status: isAttacked ? 'ALERT' : isDegraded ? 'WARNING' : 'NOMINAL',
        uptime: '99.98%',
        integrity: isAttacked ? 34 : isDegraded ? 78 : 100,
      },
      {
        id: 'ENCELADUS-2',
        name: 'Enceladus Cryo-Link',
        x: 0.75,
        y: 0.35,
        status: isDegraded ? 'WARNING' : 'NOMINAL',
        uptime: '99.99%',
        integrity: isDegraded ? 62 : 100,
      },
      {
        id: 'MIMAS-3',
        name: 'Mimas Deflector Hub',
        x: 0.45,
        y: 0.75,
        status: isAttacked ? 'ALERT' : 'NOMINAL',
        uptime: '99.95%',
        integrity: isAttacked ? 41 : 100,
      },
      {
        id: 'RHEA-4',
        name: 'Rhea Deep-Space Relay',
        x: 0.85,
        y: 0.7,
        status: 'NOMINAL',
        uptime: '100.00%',
        integrity: 100,
      },
    ];
  }, [scenario]);

  // Generate packet signals moving between nodes
  useEffect(() => {
    const interval = setInterval(() => {
      if (packets.length > 25) return;
      const fromNode = nodes[Math.floor(Math.random() * nodes.length)];
      let toNode = nodes[Math.floor(Math.random() * nodes.length)];
      while (toNode.id === fromNode.id) {
        toNode = nodes[Math.floor(Math.random() * nodes.length)];
      }

      const isThreat = scenario === 'ATTACK' || scenario === 'TAMPERING' 
        ? Math.random() > 0.4 
        : Math.random() > 0.95;

      const newPacket: SignalPacket = {
        id: `PKT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        fromX: fromNode.x * dimensions.width,
        fromY: fromNode.y * dimensions.height,
        toX: toNode.x * dimensions.width,
        toY: toNode.y * dimensions.height,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        type: isThreat ? 'THREAT' : Math.random() > 0.5 ? 'ENCRYPTED' : 'DATA',
      };

      setPackets((prev) => [...prev, newPacket]);
    }, 800);

    return () => clearInterval(interval);
  }, [nodes, dimensions, scenario, packets.length]);

  // Animate packet coordinates
  useEffect(() => {
    const anim = requestAnimationFrame(function update() {
      setPackets((prev) =>
        prev
          .map((p) => ({ ...p, progress: p.progress + p.speed }))
          .filter((p) => p.progress < 1)
      );
      requestAnimationFrame(update);
    });
    return () => cancelAnimationFrame(anim);
  }, []);

  return (
    <div 
      className="relative flex flex-col h-full w-full bg-[#030712]/80 border border-slate-800 backdrop-blur-md rounded-xl overflow-hidden p-4"
      ref={containerRef}
    >
      {/* Title & Stats */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Orbit className="h-4 w-4 text-cyan-400 animate-spin-slow" />
          <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-200">
            Orbital Tactical Link Map
          </h2>
        </div>
        <div className="flex gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Secure Data</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Threat Activity</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 min-h-[220px]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Orbital connection grid lines */}
          {nodes.map((nodeA, idx) =>
            nodes.slice(idx + 1).map((nodeB) => (
              <line
                key={`${nodeA.id}-${nodeB.id}`}
                x1={nodeA.x * dimensions.width}
                y1={nodeA.y * dimensions.height}
                x2={nodeB.x * dimensions.width}
                y2={nodeB.y * dimensions.height}
                stroke="#1e293b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            ))
          )}

          {/* Active signal pulses */}
          {packets.map((p) => {
            const currentX = p.fromX + (p.toX - p.fromX) * p.progress;
            const currentY = p.fromY + (p.toY - p.fromY) * p.progress;
            const color = p.type === 'THREAT' ? '#ef4444' : p.type === 'ENCRYPTED' ? '#34d399' : '#22d3ee';

            return (
              <g key={p.id}>
                {/* Glow ring */}
                <circle
                  cx={currentX}
                  cy={currentY}
                  r={p.type === 'THREAT' ? 6 : 4}
                  fill={color}
                  opacity={0.3}
                />
                <circle
                  cx={currentX}
                  cy={currentY}
                  r="2"
                  fill={color}
                />
              </g>
            );
          })}
        </svg>

        {/* Node Indicators */}
        {nodes.map((node) => {
          const actualX = node.x * dimensions.width;
          const actualY = node.y * dimensions.height;
          const isWarning = node.status === 'WARNING';
          const isAlert = node.status === 'ALERT';

          return (
            <div
              key={node.id}
              className="absolute group cursor-pointer -translate-x-1/2 -translate-y-1/2"
              style={{ left: actualX, top: actualY }}
              onClick={() => setSelectedNode(node)}
            >
              {/* Outer status ring */}
              <div 
                className={`flex items-center justify-center h-10 w-10 rounded-full border transition-all ${
                  isAlert 
                    ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse'
                    : isWarning
                      ? 'border-amber-500 bg-amber-950/15'
                      : 'border-cyan-500/40 bg-cyan-950/5 group-hover:border-cyan-400'
                }`}
              >
                {isAlert ? (
                  <ShieldAlert className="h-5 w-5 text-red-500 animate-bounce" />
                ) : isWarning ? (
                  <Radio className="h-4 w-4 text-amber-500" />
                ) : (
                  <Shield className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                )}
              </div>

              {/* Float Mini Nameplate */}
              <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-[#090d16] border border-slate-800 text-[9px] px-1.5 py-0.5 rounded text-slate-300 font-mono whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                {node.id}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Side Bar Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="mt-3 p-3 bg-[#0c1322] border border-slate-800 rounded-lg text-xs font-mono"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-400">{selectedNode.name}</span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 px-1 text-[10px] uppercase font-bold"
              >
                [Close]
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
              <div>
                <span className="text-slate-500 block">STATUS</span>
                <span className={`font-semibold ${
                  selectedNode.status === 'ALERT' ? 'text-red-500' : selectedNode.status === 'WARNING' ? 'text-amber-500' : 'text-emerald-400'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">INTEGRITY</span>
                <span className="font-semibold text-slate-200">{selectedNode.integrity}%</span>
              </div>
              <div>
                <span className="text-slate-500 block">UPTIME</span>
                <span className="font-semibold text-slate-400">{selectedNode.uptime}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
