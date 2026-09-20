'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SaturnBackgroundProps {
  scenario?: string;
}

function OrbitLine({ radius }: { radius: number }) {
  const lineMesh = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x0891b2,
      opacity: 0.08,
      transparent: true,
    });
    return new THREE.Line(geometry, material);
  }, [radius]);

  return <primitive object={lineMesh} />;
}

function Moon({ radius, size, color, speed, phaseOffset }: { radius: number; size: number; color: string; speed: number; phaseOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed + phaseOffset;
    meshRef.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });

  return (
    <group>
      <OrbitLine radius={radius} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function SaturnRings() {
  const ringGeo = useMemo(() => {
    const innerRadius = 3.2;
    const outerRadius = 7.5;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
    
    // Custom UV mapping for radial texturing of the rings
    const pos = geometry.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const normRadius = (r - innerRadius) / (outerRadius - innerRadius);
      geometry.attributes.uv.setXY(i, normRadius, 0.5);
    }
    return geometry;
  }, []);

  const ringTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0.0, 'rgba(185, 170, 135, 0.05)');
      grad.addColorStop(0.2, 'rgba(195, 185, 155, 0.45)');
      grad.addColorStop(0.4, 'rgba(110, 95, 80, 0.75)');
      grad.addColorStop(0.6, 'rgba(10, 8, 5, 0.02)');   // Cassini Division
      grad.addColorStop(0.7, 'rgba(165, 150, 130, 0.75)'); // A Ring
      grad.addColorStop(1.0, 'rgba(60, 50, 45, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={ringGeo} />
      <meshStandardMaterial map={ringTexture} transparent opacity={0.88} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SaturnSystem({ scenario }: { scenario: string }) {
  const systemRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  const saturnTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#dbcca0';
      ctx.fillRect(0, 0, 256, 256);
      for (let y = 0; y < 256; y++) {
        if (y > 20 && y < 45) ctx.fillStyle = '#cbbb91';
        else if (y >= 45 && y < 80) ctx.fillStyle = '#e8dec2';
        else if (y >= 80 && y < 120) ctx.fillStyle = '#c5b589';
        else if (y >= 120 && y < 160) ctx.fillStyle = '#f3ebcf';
        else if (y >= 160 && y < 200) ctx.fillStyle = '#bfaa75';
        else ctx.fillStyle = '#d4c399';
        ctx.globalAlpha = 0.5 + Math.sin(y * 0.02) * 0.15;
        ctx.fillRect(0, y, 256, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((state) => {
    if (!systemRef.current || !planetRef.current) return;
    planetRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    systemRef.current.rotation.z = -0.45 + Math.sin(state.clock.getElapsedTime() * 0.05) * 0.05;
  });

  return (
    <group ref={systemRef} position={[2.5, -0.5, 0]} rotation={[0.4, 0, -0.45]}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial map={saturnTexture} roughness={0.75} />
      </mesh>
      <SaturnRings />
      <Moon radius={9.0} size={0.12} color="#fdba74" speed={0.18} phaseOffset={0.0} />
      <Moon radius={6.5} size={0.07} color="#bae6fd" speed={0.32} phaseOffset={2.1} />
    </group>
  );
}

function SceneLighting({ scenario }: { scenario: string }) {
  const colors = useMemo(() => {
    if (scenario === 'ATTACK' || scenario === 'TAMPERING') {
      return { ambient: '#27080b', rim: '#ef4444' };
    } else if (scenario === 'DEGRADED') {
      return { ambient: '#181206', rim: '#d97706' };
    }
    return { ambient: '#030d1e', rim: '#0ea5e9' };
  }, [scenario]);

  return (
    <>
      <ambientLight color={colors.ambient} intensity={2.2} />
      <directionalLight position={[-15, 6, 12]} intensity={3.5} color="#fffbf0" />
      <pointLight position={[8, -5, -6]} intensity={2.5} color={colors.rim} />
    </>
  );
}

export default function SaturnBackground({ scenario = 'SECURE' }: SaturnBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#02040a] z-0" />;
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#02040a]">
      <Canvas camera={{ position: [0, 1, 14], fov: 42 }}>
        <color attach="background" args={['#02040a']} />
        <Stars radius={100} depth={50} count={1200} factor={4} fade speed={0.5} />
        <SaturnSystem scenario={scenario} />
        <SceneLighting scenario={scenario} />
      </Canvas>
    </div>
  );
}
