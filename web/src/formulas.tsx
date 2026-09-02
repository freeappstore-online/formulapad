import React, { useState, useEffect } from 'react';
import { FormulaItem } from './types';

// =========================================================================
// INTERACTIVE PHYSICS VISUALIZERS
// =========================================================================

function PendulumVisualizer({ v, r }: { v: Record<string, number>; r: any }) {
  const length = Math.max(0.1, v.L ?? 1.0);
  const gravity = Math.max(0.5, v.g ?? 9.81);
  const maxAngle = Math.max(5, Math.min(60, v.theta ?? 25)); // release angle in degrees

  const [angle, setAngle] = useState(0);
  const [velocity, setVelocity] = useState(0);

  // Physics-accurate continuous oscillation loop
  useEffect(() => {
    let animId: number;
    const startTime = performance.now();
    const omega = Math.sqrt(gravity / length);
    const maxAngleRad = (maxAngle * Math.PI) / 180;

    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Instantaneous angle θ(t) = θ_max * cos(ω * t)
      const currentAngle = maxAngle * Math.cos(omega * elapsed);
      // Linear velocity magnitude |v(t)| = L * ω * θ_max_rad * |sin(ω * t)|
      const currentVel = Math.abs(length * omega * maxAngleRad * Math.sin(omega * elapsed));

      setAngle(currentAngle);
      setVelocity(currentVel);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [length, gravity, maxAngle]);

  const period = 2 * Math.PI * Math.sqrt(length / gravity);
  const freq = 1 / period;

  // Dynamic visual length scaling between 55px and 115px for crisp SVG viewport fit
  const visualArmLength = 55 + 60 * Math.min(1, Math.sqrt(length / 10));

  // Pivot coordinates
  const pivotX = 200;
  const pivotY = 28;

  // Boundary coordinates for the dashed ghost swing arc
  const maxRad = (maxAngle * Math.PI) / 180;
  const arcLeftX = pivotX - visualArmLength * Math.sin(maxRad);
  const arcLeftY = pivotY + visualArmLength * Math.cos(maxRad);
  const arcRightX = pivotX + visualArmLength * Math.sin(maxRad);
  const arcRightY = pivotY + visualArmLength * Math.cos(maxRad);
  const arcBottomY = pivotY + visualArmLength;

  return (
    <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800 space-y-2">
      <div className="flex justify-between items-center text-xs text-zinc-400 font-mono pb-1.5 border-b border-zinc-800">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Harmonic Oscillation Simulation
        </span>
        <span className="text-zinc-300 font-bold font-mono">
          θ = {angle.toFixed(1)}°
        </span>
      </div>

      <svg viewBox="0 0 400 185" className="w-full h-auto select-none">
        <defs>
          {/* Bob Glow and Radial Gradient */}
          <filter id="bob-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10b981" floodOpacity="0.8" />
          </filter>
          <radialGradient id="bob-gradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
        </defs>

        {/* Ceiling Mount */}
        <line x1="140" y1={pivotY - 8} x2="260" y2={pivotY - 8} stroke="#52525b" strokeWidth="4" strokeLinecap="round" />
        {[-40, -20, 0, 20, 40].map((offset, i) => (
          <line
            key={i}
            x1={pivotX + offset - 6}
            y1={pivotY - 16}
            x2={pivotX + offset + 4}
            y2={pivotY - 8}
            stroke="#3f3f46"
            strokeWidth="2"
          />
        ))}

        {/* Vertical Center Reference Line */}
        <line
          x1={pivotX}
          y1={pivotY}
          x2={pivotX}
          y2={arcBottomY + 12}
          stroke="#3f3f46"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Swing Boundary Ghost Arc */}
        <path
          d={`M ${arcLeftX} ${arcLeftY} Q ${pivotX} ${arcBottomY + 6} ${arcRightX} ${arcRightY}`}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.35"
        />

        {/* Swing Limit Ghost Markers */}
        <circle cx={arcLeftX} cy={arcLeftY} r="6" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        <circle cx={arcRightX} cy={arcRightY} r="6" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

        {/* Angle Label */}
        <text
          x={pivotX}
          y={pivotY + 18}
          fill="#94a3b8"
          fontSize="9"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {maxAngle}°
        </text>

        {/* Animated Pendulum Arm and Bob Group */}
        <g transform={`rotate(${angle} ${pivotX} ${pivotY})`}>
          {/* Rod / String */}
          <line
            x1={pivotX}
            y1={pivotY}
            x2={pivotX}
            y2={pivotY + visualArmLength}
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Bob Mass */}
          <circle
            cx={pivotX}
            cy={pivotY + visualArmLength}
            r="11"
            fill="url(#bob-gradient)"
            filter="url(#bob-glow)"
            stroke="#ecfdf5"
            strokeWidth="1.5"
          />
          {/* Highlight Specular Reflection */}
          <circle
            cx={pivotX - 3}
            cy={pivotY + visualArmLength - 3}
            r="2.5"
            fill="#ffffff"
            opacity="0.75"
          />
        </g>

        {/* Pivot Pin */}
        <circle cx={pivotX} cy={pivotY} r="4.5" fill="#f8fafc" stroke="#18181b" strokeWidth="2" />

        {/* Live In-SVG Metric HUD */}
        <g transform="translate(18, 142)">
          <rect x="0" y="0" width="112" height="34" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" opacity="0.92" />
          <text x="8" y="13" fill="#94a3b8" fontSize="8" fontWeight={700} fontFamily="monospace">PERIOD (T)</text>
          <text x="8" y="27" fill="#34d399" fontSize="12" fontWeight={700} fontFamily="monospace">{period.toFixed(3)} s</text>
        </g>

        <g transform="translate(144, 142)">
          <rect x="0" y="0" width="112" height="34" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" opacity="0.92" />
          <text x="8" y="13" fill="#94a3b8" fontSize="8" fontWeight={700} fontFamily="monospace">VELOCITY (v)</text>
          <text x="8" y="27" fill="#38bdf8" fontSize="12" fontWeight={700} fontFamily="monospace">{velocity.toFixed(2)} m/s</text>
        </g>

        <g transform="translate(270, 142)">
          <rect x="0" y="0" width="112" height="34" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" opacity="0.92" />
          <text x="8" y="13" fill="#94a3b8" fontSize="8" fontWeight={700} fontFamily="monospace">FREQUENCY (f)</text>
          <text x="8" y="27" fill="#fbbf24" fontSize="12" fontWeight={700} fontFamily="monospace">{freq.toFixed(3)} Hz</text>
        </g>
      </svg>
    </div>
  );
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0) return 0;
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 20); i++) {
    res *= i;
  }
  return res;
}

export const FORMULA_REGISTRY: FormulaItem[] = [
  // ==========================================
  // PHYSICS (1 - 15)
  // ==========================================
  {
    id: 'ohms-law',
    title: "Ohm's Law",
    subject: 'physics',
    category: 'Electrodynamics',
    equation: 'I = V / R',
    description: 'Calculates electric current flowing through a conductor given voltage and resistance.',
    params: [
      { key: 'V', label: 'Voltage', symbol: 'V', unit: 'V', defaultVal: 12, min: 1, max: 240, step: 0.5, presets: [{ label: '3.3V', value: 3.3 }, { label: '5V', value: 5 }, { label: '12V', value: 12 }, { label: '120V', value: 120 }, { label: '240V', value: 240 }] },
      { key: 'R', label: 'Resistance', symbol: 'R', unit: 'Ω', defaultVal: 4, min: 0.1, max: 100, step: 0.1, presets: [{ label: '1Ω', value: 1 }, { label: '4Ω', value: 4 }, { label: '10Ω', value: 10 }, { label: '50Ω', value: 50 }] },
    ],
    calculate: (v) => {
      const I = v.V / Math.max(0.001, v.R);
      const P = v.V * I;
      return {
        primaryValue: I.toFixed(3),
        primaryUnit: 'A',
        primarySymbol: 'I',
        substitutionSteps: [
          `I = V / R`,
          `I = ${v.V} V / ${v.R} Ω`,
          `I = ${(v.V / v.R).toFixed(4)} A`,
          `Power Dissipation P = V × I = ${v.V} × ${I.toFixed(3)} = ${P.toFixed(2)} W`,
        ],
        metrics: [
          { label: 'Current Flow (I)', symbol: 'I', value: I.toFixed(3), unit: 'A', color: 'emerald' },
          { label: 'Power Dissipated (P)', symbol: 'P', value: P.toFixed(2), unit: 'W', color: 'amber' },
        ],
      };
    },
    renderVisual: (v, r) => {
      const current = parseFloat(r.primaryValue) || 0;
      const speed = current > 0 ? Math.max(0.4, Math.min(5, 10 / current)) : 9999;
      return (
        <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
            <span>DC Circuit Electron Simulation</span>
            <span>Speed: {(1 / speed).toFixed(2)} rev/s</span>
          </div>
          <svg viewBox="0 0 400 180" className="w-full h-auto">
            <path id="loop-ohm" d="M 60 40 L 340 40 Q 370 40 370 70 L 370 110 Q 370 140 340 140 L 60 140 Q 30 140 30 110 L 30 70 Q 30 40 60 40 Z" fill="none" stroke="#38bdf8" strokeWidth="4" />
            {Array.from({ length: 12 }).map((_, i) => (
              <circle key={i} r="3.5" fill="#facc15">
                <animateMotion dur={`${speed}s`} repeatCount="indefinite" begin={`${(i * speed) / 12}s`} rotate="auto">
                  <mpath href="#loop-ohm" />
                </animateMotion>
              </circle>
            ))}
            {/* Battery */}
            <g transform="translate(30, 90)">
              <rect x="-15" y="-20" width="30" height="40" rx="4" fill="#27272a" stroke="#eab308" strokeWidth="1.5" />
              <text x="0" y="4" fill="#fef08a" fontSize="9" fontWeight={700} textAnchor="middle" fontFamily="monospace">{v.V}V</text>
            </g>
            {/* Resistor */}
            <g transform="translate(370, 90)">
              <rect x="-14" y="-25" width="28" height="50" rx="4" fill="#451a03" stroke="#f97316" strokeWidth="1.5" />
              <text x="0" y="4" fill="#ffedd5" fontSize="9" fontWeight={700} textAnchor="middle" fontFamily="monospace">{v.R}Ω</text>
            </g>
          </svg>
        </div>
      );
    },
  },

  {
    id: 'electrical-power',
    title: 'Electrical Power',
    subject: 'physics',
    category: 'Electrodynamics',
    equation: 'P = V × I = I²R',
    description: 'Measures the rate at which electrical energy is converted into work or thermal heat.',
    params: [
      { key: 'V', label: 'Voltage', symbol: 'V', unit: 'V', defaultVal: 120, min: 1, max: 400, step: 1, presets: [{ label: '12V', value: 12 }, { label: '120V', value: 120 }, { label: '230V', value: 230 }] },
      { key: 'I', label: 'Current', symbol: 'I', unit: 'A', defaultVal: 5, min: 0.1, max: 50, step: 0.1, presets: [{ label: '1A', value: 1 }, { label: '5A', value: 5 }, { label: '15A', value: 15 }] },
    ],
    calculate: (v) => {
      const P = v.V * v.I;
      const R = v.V / Math.max(0.001, v.I);
      return {
        primaryValue: P.toFixed(2),
        primaryUnit: 'W',
        primarySymbol: 'P',
        substitutionSteps: [
          `P = V × I`,
          `P = ${v.V} V × ${v.I} A`,
          `P = ${P.toFixed(2)} W (${(P / 1000).toFixed(3)} kW)`,
          `Equivalent Resistance R = V / I = ${R.toFixed(2)} Ω`,
        ],
        metrics: [
          { label: 'Power Output', symbol: 'P', value: P.toFixed(1), unit: 'W', color: 'amber' },
          { label: 'Kilowatts', symbol: 'kW', value: (P / 1000).toFixed(3), unit: 'kW', color: 'indigo' },
          { label: 'Resistance', symbol: 'R', value: R.toFixed(2), unit: 'Ω', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'kinematics-velocity',
    title: 'Kinematics: Velocity-Time',
    subject: 'physics',
    category: 'Mechanics',
    equation: 'v = u + a · t',
    description: 'Calculates the final velocity of an accelerating object after elapsed time t.',
    params: [
      { key: 'u', label: 'Initial Velocity', symbol: 'u', unit: 'm/s', defaultVal: 5, min: 0, max: 100, step: 0.5, presets: [{ label: 'Rest (0)', value: 0 }, { label: '10 m/s', value: 10 }, { label: '30 m/s', value: 30 }] },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm/s²', defaultVal: 9.8, min: -20, max: 50, step: 0.1, presets: [{ label: 'g (9.8)', value: 9.8 }, { label: '2 m/s²', value: 2 }, { label: '5 m/s²', value: 5 }] },
      { key: 't', label: 'Time Elapsed', symbol: 't', unit: 's', defaultVal: 4, min: 0.1, max: 60, step: 0.1, presets: [{ label: '2s', value: 2 }, { label: '5s', value: 5 }, { label: '10s', value: 10 }] },
    ],
    calculate: (v) => {
      const finalV = v.u + v.a * v.t;
      const disp = v.u * v.t + 0.5 * v.a * v.t * v.t;
      return {
        primaryValue: finalV.toFixed(2),
        primaryUnit: 'm/s',
        primarySymbol: 'v',
        substitutionSteps: [
          `v = u + a · t`,
          `v = ${v.u} + (${v.a}) · (${v.t})`,
          `v = ${v.u} + ${(v.a * v.t).toFixed(2)} = ${finalV.toFixed(2)} m/s`,
          `Total Displacement s = ut + ½at² = ${disp.toFixed(2)} m`,
        ],
        metrics: [
          { label: 'Final Velocity (v)', symbol: 'v', value: finalV.toFixed(2), unit: 'm/s', color: 'emerald' },
          { label: 'Velocity in km/h', symbol: 'km/h', value: (finalV * 3.6).toFixed(1), unit: 'km/h', color: 'indigo' },
          { label: 'Displacement (s)', symbol: 's', value: disp.toFixed(2), unit: 'm', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'kinematics-displacement',
    title: 'Kinematics: Displacement',
    subject: 'physics',
    category: 'Mechanics',
    equation: 's = u · t + ½ a · t²',
    description: 'Calculates the total distance travelled by an object under constant acceleration.',
    params: [
      { key: 'u', label: 'Initial Velocity', symbol: 'u', unit: 'm/s', defaultVal: 0, min: 0, max: 80, step: 1, presets: [{ label: '0 m/s', value: 0 }, { label: '15 m/s', value: 15 }] },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm/s²', defaultVal: 9.81, min: 0, max: 30, step: 0.1, presets: [{ label: '9.81 m/s²', value: 9.81 }, { label: '3 m/s²', value: 3 }] },
      { key: 't', label: 'Time Elapsed', symbol: 't', unit: 's', defaultVal: 3, min: 0.1, max: 30, step: 0.1, presets: [{ label: '1s', value: 1 }, { label: '3s', value: 3 }, { label: '5s', value: 5 }] },
    ],
    calculate: (v) => {
      const s = v.u * v.t + 0.5 * v.a * v.t * v.t;
      return {
        primaryValue: s.toFixed(2),
        primaryUnit: 'm',
        primarySymbol: 's',
        substitutionSteps: [
          `s = u · t + ½ a · t²`,
          `s = (${v.u})(${v.t}) + 0.5 × (${v.a}) × (${v.t})²`,
          `s = ${(v.u * v.t).toFixed(2)} + ${(0.5 * v.a * v.t * v.t).toFixed(2)} = ${s.toFixed(2)} m`,
        ],
        metrics: [
          { label: 'Displacement (s)', symbol: 's', value: s.toFixed(2), unit: 'm', color: 'emerald' },
          { label: 'In Feet', symbol: 'ft', value: (s * 3.28084).toFixed(1), unit: 'ft', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'kinematics-vel-disp',
    title: 'Kinematics: Velocity-Displacement',
    subject: 'physics',
    category: 'Mechanics',
    equation: 'v² = u² + 2as',
    description: 'Connects initial velocity, acceleration, and displacement without requiring time.',
    params: [
      { key: 'u', label: 'Initial Velocity', symbol: 'u', unit: 'm/s', defaultVal: 10, min: 0, max: 100, step: 1, presets: [{ label: '0 m/s', value: 0 }, { label: '10 m/s', value: 10 }, { label: '25 m/s', value: 25 }] },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm/s²', defaultVal: 4, min: 0.1, max: 30, step: 0.5, presets: [{ label: '2 m/s²', value: 2 }, { label: '4 m/s²', value: 4 }, { label: '9.8 m/s²', value: 9.8 }] },
      { key: 's', label: 'Displacement', symbol: 's', unit: 'm', defaultVal: 50, min: 1, max: 500, step: 5, presets: [{ label: '20 m', value: 20 }, { label: '50 m', value: 50 }, { label: '100 m', value: 100 }] },
    ],
    calculate: (v) => {
      const vSquared = v.u * v.u + 2 * v.a * v.s;
      const finalV = Math.sqrt(Math.max(0, vSquared));
      return {
        primaryValue: finalV.toFixed(2),
        primaryUnit: 'm/s',
        primarySymbol: 'v',
        substitutionSteps: [
          `v² = u² + 2as`,
          `v² = (${v.u})² + 2(${v.a})(${v.s}) = ${(v.u * v.u).toFixed(1)} + ${(2 * v.a * v.s).toFixed(1)} = ${vSquared.toFixed(1)}`,
          `v = √(${vSquared.toFixed(1)}) = ${finalV.toFixed(2)} m/s`,
        ],
        metrics: [
          { label: 'Final Velocity', symbol: 'v', value: finalV.toFixed(2), unit: 'm/s', color: 'emerald' },
          { label: 'Velocity (km/h)', symbol: 'km/h', value: (finalV * 3.6).toFixed(1), unit: 'km/h', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'projectile-range',
    title: 'Projectile Motion Range',
    subject: 'physics',
    category: 'Mechanics',
    equation: 'R = (v₀² · sin(2θ)) / g',
    description: 'Computes maximum horizontal range and trajectory apex for a launch angle and initial speed.',
    params: [
      { key: 'v0', label: 'Initial Velocity', symbol: 'v₀', unit: 'm/s', defaultVal: 25, min: 1, max: 100, step: 1, presets: [{ label: '15 m/s', value: 15 }, { label: '25 m/s', value: 25 }, { label: '40 m/s', value: 40 }] },
      { key: 'theta', label: 'Launch Angle', symbol: 'θ', unit: '°', defaultVal: 45, min: 5, max: 85, step: 1, presets: [{ label: '30°', value: 30 }, { label: '45°', value: 45 }, { label: '60°', value: 60 }] },
      { key: 'g', label: 'Gravity', symbol: 'g', unit: 'm/s²', defaultVal: 9.81, min: 1, max: 25, step: 0.1, presets: [{ label: 'Earth (9.81)', value: 9.81 }, { label: 'Moon (1.62)', value: 1.62 }, { label: 'Mars (3.72)', value: 3.72 }] },
    ],
    calculate: (v) => {
      const rad = (v.theta * Math.PI) / 180;
      const R = (v.v0 * v.v0 * Math.sin(2 * rad)) / v.g;
      const H = (v.v0 * v.v0 * Math.sin(rad) * Math.sin(rad)) / (2 * v.g);
      const T = (2 * v.v0 * Math.sin(rad)) / v.g;
      return {
        primaryValue: R.toFixed(2),
        primaryUnit: 'm',
        primarySymbol: 'R',
        substitutionSteps: [
          `R = (v₀² · sin(2θ)) / g`,
          `R = (${v.v0}² · sin(2 × ${v.theta}°)) / ${v.g}`,
          `R = (${(v.v0 * v.v0).toFixed(1)} · ${Math.sin(2 * rad).toFixed(3)}) / ${v.g} = ${R.toFixed(2)} m`,
          `Apex Height H = ${H.toFixed(2)} m | Flight Time T = ${T.toFixed(2)} s`,
        ],
        metrics: [
          { label: 'Horizontal Range (R)', symbol: 'R', value: R.toFixed(2), unit: 'm', color: 'emerald' },
          { label: 'Max Height (H)', symbol: 'H', value: H.toFixed(2), unit: 'm', color: 'amber' },
          { label: 'Flight Time (T)', symbol: 'T', value: T.toFixed(2), unit: 's', color: 'cyan' },
        ],
      };
    },
    renderVisual: (v, r) => {
      const range = parseFloat(r.primaryValue) || 50;
      const rad = (v.theta * Math.PI) / 180;
      const maxH = (v.v0 * v.v0 * Math.sin(rad) * Math.sin(rad)) / (2 * v.g);
      return (
        <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
            <span>Parabolic Arc Visualizer</span>
            <span>θ = {v.theta}°</span>
          </div>
          <svg viewBox="0 0 400 160" className="w-full h-auto">
            <line x1="30" y1="130" x2="370" y2="130" stroke="#52525b" strokeWidth="2" />
            <path d={`M 40 130 Q 200 ${Math.max(20, 130 - (maxH / Math.max(1, range)) * 260)} 360 130`} fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4 2" />
            <circle cx="200" cy={Math.max(20, 130 - (maxH / Math.max(1, range)) * 260)} r="4" fill="#fbbf24" />
            <text x="200" y={Math.max(14, 120 - (maxH / Math.max(1, range)) * 260)} fill="#fde047" fontSize="10" textAnchor="middle" fontFamily="monospace">Apex: {maxH.toFixed(1)}m</text>
            <circle cx="360" cy="130" r="4" fill="#38bdf8" />
            <text x="360" y="145" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">R: {range.toFixed(1)}m</text>
          </svg>
        </div>
      );
    },
  },

  {
    id: 'newtons-second-law',
    title: "Newton's Second Law",
    subject: 'physics',
    category: 'Mechanics',
    equation: 'F = m · a',
    description: 'Fundamental law describing net force as the product of mass and linear acceleration.',
    params: [
      { key: 'm', label: 'Mass', symbol: 'm', unit: 'kg', defaultVal: 10, min: 0.5, max: 500, step: 0.5, presets: [{ label: '2 kg', value: 2 }, { label: '10 kg', value: 10 }, { label: '50 kg', value: 50 }] },
      { key: 'a', label: 'Acceleration', symbol: 'a', unit: 'm/s²', defaultVal: 5, min: 0.1, max: 50, step: 0.5, presets: [{ label: '1 m/s²', value: 1 }, { label: '5 m/s²', value: 5 }, { label: '9.8 m/s²', value: 9.8 }] },
    ],
    calculate: (v) => {
      const F = v.m * v.a;
      return {
        primaryValue: F.toFixed(2),
        primaryUnit: 'N',
        primarySymbol: 'F',
        substitutionSteps: [
          `F = m · a`,
          `F = ${v.m} kg × ${v.a} m/s²`,
          `F = ${F.toFixed(2)} Newtons (N)`,
        ],
        metrics: [
          { label: 'Net Force (F)', symbol: 'F', value: F.toFixed(2), unit: 'N', color: 'emerald' },
          { label: 'Weight on Earth (mg)', symbol: 'W', value: (v.m * 9.81).toFixed(1), unit: 'N', color: 'amber' },
        ],
      };
    },
    renderVisual: (v, r) => {
      const force = parseFloat(r.primaryValue) || 50;
      const arrowLen = Math.min(100, Math.max(20, force / 5));
      return (
        <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
            <span>Force Vector Representation</span>
            <span>m = {v.m} kg</span>
          </div>
          <svg viewBox="0 0 400 120" className="w-full h-auto">
            <line x1="20" y1="90" x2="380" y2="90" stroke="#3f3f46" strokeWidth="2" />
            <rect x="150" y="40" width="60" height="50" rx="4" fill="#312e81" stroke="#6366f1" strokeWidth="2" />
            <text x="180" y="68" fill="#e0e7ff" fontSize="11" fontWeight={700} textAnchor="middle">{v.m} kg</text>
            <line x1="210" y1="65" x2={210 + arrowLen} y2="65" stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrow)" />
            <polygon points={`${210 + arrowLen},60 ${210 + arrowLen + 8},65 ${210 + arrowLen},70`} fill="#22c55e" />
            <text x={215 + arrowLen / 2} y="55" fill="#4ade80" fontSize="10" fontFamily="monospace" fontWeight={700}>F={force.toFixed(0)}N</text>
          </svg>
        </div>
      );
    },
  },

  {
    id: 'kinetic-energy',
    title: 'Kinetic Energy',
    subject: 'physics',
    category: 'Energy',
    equation: 'E_k = ½ m · v²',
    description: 'Calculates the energy possessed by an object due to its motion.',
    params: [
      { key: 'm', label: 'Mass', symbol: 'm', unit: 'kg', defaultVal: 80, min: 0.1, max: 2000, step: 1, presets: [{ label: '1 kg', value: 1 }, { label: '80 kg', value: 80 }, { label: '1500 kg (Car)', value: 1500 }] },
      { key: 'v', label: 'Velocity', symbol: 'v', unit: 'm/s', defaultVal: 15, min: 0, max: 100, step: 0.5, presets: [{ label: '5 m/s', value: 5 }, { label: '15 m/s', value: 15 }, { label: '30 m/s', value: 30 }] },
    ],
    calculate: (v) => {
      const Ek = 0.5 * v.m * v.v * v.v;
      return {
        primaryValue: Ek.toFixed(1),
        primaryUnit: 'J',
        primarySymbol: 'E_k',
        substitutionSteps: [
          `E_k = ½ · m · v²`,
          `E_k = 0.5 × ${v.m} kg × (${v.v} m/s)²`,
          `E_k = 0.5 × ${v.m} × ${(v.v * v.v).toFixed(1)} = ${Ek.toFixed(1)} Joules`,
          `Equivalent to ${(Ek / 1000).toFixed(3)} kJ`,
        ],
        metrics: [
          { label: 'Kinetic Energy', symbol: 'E_k', value: Ek.toFixed(1), unit: 'J', color: 'emerald' },
          { label: 'Kilojoules', symbol: 'kJ', value: (Ek / 1000).toFixed(3), unit: 'kJ', color: 'amber' },
        ],
      };
    },
  },

  {
    id: 'gravitational-pe',
    title: 'Gravitational Potential Energy',
    subject: 'physics',
    category: 'Energy',
    equation: 'E_p = m · g · h',
    description: 'Energy stored in an object as a result of its vertical position or height.',
    params: [
      { key: 'm', label: 'Mass', symbol: 'm', unit: 'kg', defaultVal: 20, min: 0.1, max: 500, step: 0.5, presets: [{ label: '5 kg', value: 5 }, { label: '20 kg', value: 20 }, { label: '100 kg', value: 100 }] },
      { key: 'g', label: 'Gravity', symbol: 'g', unit: 'm/s²', defaultVal: 9.81, min: 1, max: 25, step: 0.1, presets: [{ label: 'Earth (9.81)', value: 9.81 }, { label: 'Moon (1.62)', value: 1.62 }] },
      { key: 'h', label: 'Height', symbol: 'h', unit: 'm', defaultVal: 10, min: 0.1, max: 200, step: 0.5, presets: [{ label: '2 m', value: 2 }, { label: '10 m', value: 10 }, { label: '50 m', value: 50 }] },
    ],
    calculate: (v) => {
      const Ep = v.m * v.g * v.h;
      return {
        primaryValue: Ep.toFixed(1),
        primaryUnit: 'J',
        primarySymbol: 'E_p',
        substitutionSteps: [
          `E_p = m · g · h`,
          `E_p = ${v.m} kg × ${v.g} m/s² × ${v.h} m`,
          `E_p = ${Ep.toFixed(1)} Joules (${(Ep / 1000).toFixed(3)} kJ)`,
        ],
        metrics: [
          { label: 'Potential Energy', symbol: 'E_p', value: Ep.toFixed(1), unit: 'J', color: 'emerald' },
          { label: 'Kilojoules', symbol: 'kJ', value: (Ep / 1000).toFixed(3), unit: 'kJ', color: 'amber' },
        ],
      };
    },
  },

  {
    id: 'universal-gravitation',
    title: 'Universal Gravitation',
    subject: 'physics',
    category: 'Astrophysics',
    equation: 'F = G · (m₁ · m₂) / r²',
    description: "Newton's law of universal gravitational attraction between two massive bodies.",
    params: [
      { key: 'm1', label: 'Mass 1 (×10²⁴ kg)', symbol: 'm₁', unit: '10²⁴ kg', defaultVal: 5.97, min: 0.01, max: 2000, step: 0.1, presets: [{ label: 'Earth (5.97)', value: 5.97 }, { label: 'Moon (0.073)', value: 0.073 }, { label: 'Sun (1989)', value: 1989 }] },
      { key: 'm2', label: 'Mass 2 (×10²² kg)', symbol: 'm₂', unit: '10²² kg', defaultVal: 7.35, min: 0.01, max: 500, step: 0.1, presets: [{ label: 'Moon (7.35)', value: 7.35 }, { label: 'Satellite (0.0001)', value: 0.0001 }] },
      { key: 'r', label: 'Distance (×10⁶ m)', symbol: 'r', unit: '10⁶ m', defaultVal: 384.4, min: 1, max: 5000, step: 5, presets: [{ label: 'Earth-Moon (384.4)', value: 384.4 }, { label: 'LEO Orbit (6.7)', value: 6.7 }] },
    ],
    calculate: (v) => {
      const G = 6.6743e-11;
      const m1Actual = v.m1 * 1e24;
      const m2Actual = v.m2 * 1e22;
      const rActual = v.r * 1e6;
      const F = (G * m1Actual * m2Actual) / (rActual * rActual);
      return {
        primaryValue: F.toExponential(3),
        primaryUnit: 'N',
        primarySymbol: 'F',
        substitutionSteps: [
          `F = G · (m₁ · m₂) / r²`,
          `G = 6.6743 × 10⁻¹¹ N·m²/kg²`,
          `F = (6.6743e-11 × ${v.m1}e24 × ${v.m2}e22) / (${v.r}e6)²`,
          `F = ${F.toExponential(4)} N`,
        ],
        metrics: [
          { label: 'Attraction Force', symbol: 'F', value: F.toExponential(3), unit: 'N', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'wave-speed',
    title: 'Wave Speed Formula',
    subject: 'physics',
    category: 'Waves & Optics',
    equation: 'v = f · λ',
    description: 'Determines the propagation speed of transverse and longitudinal waves from frequency and wavelength.',
    params: [
      { key: 'f', label: 'Frequency', symbol: 'f', unit: 'Hz', defaultVal: 440, min: 1, max: 5000, step: 5, presets: [{ label: '10 Hz', value: 10 }, { label: '440 Hz (Note A)', value: 440 }, { label: '1000 Hz', value: 1000 }] },
      { key: 'lambda', label: 'Wavelength', symbol: 'λ', unit: 'm', defaultVal: 0.77, min: 0.01, max: 20, step: 0.01, presets: [{ label: '0.34 m', value: 0.34 }, { label: '0.77 m', value: 0.77 }, { label: '2.5 m', value: 2.5 }] },
    ],
    calculate: (v) => {
      const vel = v.f * v.lambda;
      return {
        primaryValue: vel.toFixed(2),
        primaryUnit: 'm/s',
        primarySymbol: 'v',
        substitutionSteps: [
          `v = f · λ`,
          `v = ${v.f} Hz × ${v.lambda} m`,
          `v = ${vel.toFixed(2)} m/s (${(vel * 3.6).toFixed(1)} km/h)`,
        ],
        metrics: [
          { label: 'Wave Velocity', symbol: 'v', value: vel.toFixed(2), unit: 'm/s', color: 'emerald' },
          { label: 'Period (T = 1/f)', symbol: 'T', value: (1 / v.f).toFixed(4), unit: 's', color: 'cyan' },
        ],
      };
    },
    renderVisual: (v) => (
      <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
        <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
          <span>Oscillating Sine Wave</span>
          <span>f = {v.f} Hz</span>
        </div>
        <svg viewBox="0 0 400 100" className="w-full h-auto">
          <line x1="10" y1="50" x2="390" y2="50" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
          <path
            d="M 10 50 Q 60 10 110 50 T 210 50 T 310 50 T 390 50"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
          />
          <circle cx="110" cy="50" r="4" fill="#38bdf8" />
          <circle cx="310" cy="50" r="4" fill="#38bdf8" />
          <line x1="110" y1="50" x2="310" y2="50" stroke="#f59e0b" strokeWidth="2" />
          <text x="210" y="42" fill="#fde047" fontSize="10" textAnchor="middle" fontFamily="monospace">λ = {v.lambda}m</text>
        </svg>
      </div>
    ),
  },

  {
    id: 'pendulum-period',
    title: 'Simple Pendulum Period',
    subject: 'physics',
    category: 'Harmonics',
    equation: 'T = 2π √(L / g)',
    description: 'Calculates the period of oscillation of a simple pendulum with string length L under gravity g and release angle θ.',
    params: [
      {
        key: 'L',
        label: 'Pendulum Length',
        symbol: 'L',
        unit: 'm',
        defaultVal: 1.0,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        presets: [
          { label: '0.25 m', value: 0.25 },
          { label: '0.5 m', value: 0.5 },
          { label: '1.0 m', value: 1.0 },
          { label: '2.0 m', value: 2.0 },
          { label: '5.0 m', value: 5.0 },
        ],
      },
      {
        key: 'g',
        label: 'Gravity',
        symbol: 'g',
        unit: 'm/s²',
        defaultVal: 9.81,
        min: 1.0,
        max: 30.0,
        step: 0.01,
        presets: [
          { label: '🌍 Earth (9.81)', value: 9.81 },
          { label: '🌕 Moon (1.62)', value: 1.62 },
          { label: '🚀 Mars (3.72)', value: 3.72 },
          { label: '🪐 Jupiter (24.79)', value: 24.79 },
        ],
      },
      {
        key: 'theta',
        label: 'Release Angle',
        symbol: 'θ',
        unit: '°',
        defaultVal: 25,
        min: 5,
        max: 45,
        step: 1,
        presets: [
          { label: '10°', value: 10 },
          { label: '20°', value: 20 },
          { label: '25°', value: 25 },
          { label: '35°', value: 35 },
          { label: '45°', value: 45 },
        ],
      },
    ],
    calculate: (v) => {
      const L = Math.max(0.001, v.L ?? 1.0);
      const g = Math.max(0.001, v.g ?? 9.81);
      const theta = v.theta ?? 25;
      const thetaRad = (theta * Math.PI) / 180;

      const T = 2 * Math.PI * Math.sqrt(L / g);
      const freq = 1 / T;
      const omega = Math.sqrt(g / L);
      const maxV = Math.sqrt(2 * g * L * (1 - Math.cos(thetaRad)));

      return {
        primaryValue: T.toFixed(3),
        primaryUnit: 's',
        primarySymbol: 'T',
        substitutionSteps: [
          `T = 2π · √(L / g)`,
          `T = 2π · √(${L} m / ${g} m/s²)`,
          `T = 2π · √(${(L / g).toFixed(4)}) = ${T.toFixed(3)} seconds`,
          `Angular Frequency ω = √(g / L) = √(${g} / ${L}) = ${omega.toFixed(3)} rad/s`,
          `Maximum Linear Velocity v_max = √(2gL(1 - cos θ)) = ${maxV.toFixed(2)} m/s`,
        ],
        metrics: [
          { label: 'Period (T)', symbol: 'T', value: T.toFixed(3), unit: 's', color: 'emerald' },
          { label: 'Frequency (f)', symbol: 'f', value: freq.toFixed(3), unit: 'Hz', color: 'cyan' },
          { label: 'Angular Speed (ω)', symbol: 'ω', value: omega.toFixed(2), unit: 'rad/s', color: 'indigo' },
          { label: 'Max Velocity', symbol: 'v_max', value: maxV.toFixed(2), unit: 'm/s', color: 'amber' },
        ],
      };
    },
    renderVisual: (v, r) => <PendulumVisualizer v={v} r={r} />,
  },

  {
    id: 'work-done',
    title: 'Work Done Formula',
    subject: 'physics',
    category: 'Energy',
    equation: 'W = F · d · cos(θ)',
    description: 'Work done when a force causes displacement at an angle θ.',
    params: [
      { key: 'F', label: 'Force', symbol: 'F', unit: 'N', defaultVal: 50, min: 1, max: 1000, step: 5, presets: [{ label: '10 N', value: 10 }, { label: '50 N', value: 50 }, { label: '200 N', value: 200 }] },
      { key: 'd', label: 'Displacement', symbol: 'd', unit: 'm', defaultVal: 8, min: 0.1, max: 200, step: 0.5, presets: [{ label: '2 m', value: 2 }, { label: '8 m', value: 8 }, { label: '25 m', value: 25 }] },
      { key: 'theta', label: 'Angle', symbol: 'θ', unit: '°', defaultVal: 0, min: 0, max: 180, step: 5, presets: [{ label: '0° (Parallel)', value: 0 }, { label: '30°', value: 30 }, { label: '60°', value: 60 }, { label: '90° (No work)', value: 90 }] },
    ],
    calculate: (v) => {
      const rad = (v.theta * Math.PI) / 180;
      const W = v.F * v.d * Math.cos(rad);
      return {
        primaryValue: W.toFixed(1),
        primaryUnit: 'J',
        primarySymbol: 'W',
        substitutionSteps: [
          `W = F · d · cos(θ)`,
          `W = ${v.F} N × ${v.d} m × cos(${v.theta}°)`,
          `W = ${v.F} × ${v.d} × ${Math.cos(rad).toFixed(3)} = ${W.toFixed(1)} Joules`,
        ],
        metrics: [
          { label: 'Work Done (W)', symbol: 'W', value: W.toFixed(1), unit: 'J', color: 'emerald' },
          { label: 'Efficiency Factor', symbol: 'cos θ', value: Math.cos(rad).toFixed(3), unit: '', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'snells-law',
    title: "Snell's Law of Refraction",
    subject: 'physics',
    category: 'Waves & Optics',
    equation: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)',
    description: 'Calculates the refraction angle θ₂ when light transitions across an optical boundary.',
    params: [
      { key: 'n1', label: 'Index 1 (n₁)', symbol: 'n₁', unit: '', defaultVal: 1.0, min: 1.0, max: 3.0, step: 0.05, presets: [{ label: 'Air (1.00)', value: 1.0 }, { label: 'Water (1.33)', value: 1.33 }, { label: 'Glass (1.50)', value: 1.50 }] },
      { key: 'theta1', label: 'Angle of Incidence (θ₁)', symbol: 'θ₁', unit: '°', defaultVal: 45, min: 1, max: 89, step: 1, presets: [{ label: '30°', value: 30 }, { label: '45°', value: 45 }, { label: '60°', value: 60 }] },
      { key: 'n2', label: 'Index 2 (n₂)', symbol: 'n₂', unit: '', defaultVal: 1.5, min: 1.0, max: 3.0, step: 0.05, presets: [{ label: 'Water (1.33)', value: 1.33 }, { label: 'Glass (1.50)', value: 1.5 }, { label: 'Diamond (2.42)', value: 2.42 }] },
    ],
    calculate: (v) => {
      const rad1 = (v.theta1 * Math.PI) / 180;
      const sinTheta2 = (v.n1 * Math.sin(rad1)) / v.n2;
      const isTIR = sinTheta2 > 1.0;
      const theta2Deg = isTIR ? 0 : (Math.asin(sinTheta2) * 180) / Math.PI;

      return {
        primaryValue: isTIR ? 'TIR (No Refraction)' : theta2Deg.toFixed(2),
        primaryUnit: isTIR ? '' : '°',
        primarySymbol: 'θ₂',
        substitutionSteps: [
          `sin(θ₂) = (n₁ · sin(θ₁)) / n₂`,
          `sin(θ₂) = (${v.n1} · sin(${v.theta1}°)) / ${v.n2} = ${sinTheta2.toFixed(4)}`,
          isTIR
            ? `Total Internal Reflection occurred (sin θ₂ > 1.0)`
            : `θ₂ = arcsin(${sinTheta2.toFixed(4)}) = ${theta2Deg.toFixed(2)}°`,
        ],
        metrics: [
          { label: 'Refraction Angle', symbol: 'θ₂', value: isTIR ? 'TIR' : theta2Deg.toFixed(2), unit: '°', color: 'emerald' },
          { label: 'Ratio n₁/n₂', symbol: 'ratio', value: (v.n1 / v.n2).toFixed(3), unit: '', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'coulombs-law',
    title: "Coulomb's Law",
    subject: 'physics',
    category: 'Electrodynamics',
    equation: 'F = k_e · |q₁ · q₂| / r²',
    description: 'Electrostatic force of attraction or repulsion between two point charges.',
    params: [
      { key: 'q1', label: 'Charge 1 (μC)', symbol: 'q₁', unit: 'μC', defaultVal: 5, min: -50, max: 50, step: 0.5, presets: [{ label: '1 μC', value: 1 }, { label: '5 μC', value: 5 }, { label: '-5 μC', value: -5 }] },
      { key: 'q2', label: 'Charge 2 (μC)', symbol: 'q₂', unit: 'μC', defaultVal: -10, min: -50, max: 50, step: 0.5, presets: [{ label: '2 μC', value: 2 }, { label: '-10 μC', value: -10 }] },
      { key: 'r', label: 'Separation (r)', symbol: 'r', unit: 'm', defaultVal: 0.5, min: 0.05, max: 5, step: 0.05, presets: [{ label: '0.1 m', value: 0.1 }, { label: '0.5 m', value: 0.5 }, { label: '1.0 m', value: 1.0 }] },
    ],
    calculate: (v) => {
      const ke = 8.98755e9;
      const q1C = v.q1 * 1e-6;
      const q2C = v.q2 * 1e-6;
      const F = (ke * Math.abs(q1C * q2C)) / (v.r * v.r);
      const isAttractive = (v.q1 * v.q2) < 0;

      return {
        primaryValue: F.toFixed(3),
        primaryUnit: 'N',
        primarySymbol: 'F',
        substitutionSteps: [
          `F = k_e · |q₁ · q₂| / r² (k_e = 8.988 × 10⁹)`,
          `F = (8.988e9 × |${v.q1}e-6 × ${v.q2}e-6|) / (${v.r})²`,
          `F = ${F.toFixed(3)} N (${isAttractive ? 'Attractive' : 'Repulsive'})`,
        ],
        metrics: [
          { label: 'Electrostatic Force', symbol: 'F', value: F.toFixed(3), unit: 'N', color: 'emerald' },
          { label: 'Interaction Type', symbol: 'type', value: isAttractive ? 'Attraction' : 'Repulsion', unit: '', color: isAttractive ? 'cyan' : 'amber' },
        ],
      };
    },
  },

  // ==========================================
  // MATHEMATICS (16 - 30)
  // ==========================================
  {
    id: 'quadratic-formula',
    title: 'Quadratic Formula',
    subject: 'math',
    category: 'Algebra',
    equation: 'x = (-b ± √(b² - 4ac)) / (2a)',
    description: 'Finds roots, discriminant Δ, and vertex extrema of a standard quadratic polynomial.',
    params: [
      { key: 'a', label: 'Coefficient a', symbol: 'a', unit: '', defaultVal: 1, min: -10, max: 10, step: 0.5, presets: [{ label: 'a = 1', value: 1 }, { label: 'a = 2', value: 2 }, { label: 'a = -1', value: -1 }] },
      { key: 'b', label: 'Coefficient b', symbol: 'b', unit: '', defaultVal: -5, min: -20, max: 20, step: 0.5, presets: [{ label: 'b = -5', value: -5 }, { label: 'b = 0', value: 0 }, { label: 'b = 6', value: 6 }] },
      { key: 'c', label: 'Coefficient c', symbol: 'c', unit: '', defaultVal: 6, min: -20, max: 20, step: 0.5, presets: [{ label: 'c = 6', value: 6 }, { label: 'c = -4', value: -4 }, { label: 'c = 0', value: 0 }] },
    ],
    calculate: (v) => {
      const a = v.a || 0.0001;
      const delta = v.b * v.b - 4 * a * v.c;
      let rootStr = '';
      if (delta > 0) {
        const r1 = (-v.b + Math.sqrt(delta)) / (2 * a);
        const r2 = (-v.b - Math.sqrt(delta)) / (2 * a);
        rootStr = `x₁ = ${r1.toFixed(2)}, x₂ = ${r2.toFixed(2)}`;
      } else if (Math.abs(delta) < 0.0001) {
        const r = -v.b / (2 * a);
        rootStr = `x = ${r.toFixed(2)} (Double root)`;
      } else {
        const real = (-v.b / (2 * a)).toFixed(2);
        const imag = (Math.sqrt(-delta) / (2 * a)).toFixed(2);
        rootStr = `${real} ± ${imag}i (Complex)`;
      }

      return {
        primaryValue: rootStr,
        primaryUnit: '',
        primarySymbol: 'Roots',
        substitutionSteps: [
          `Δ = b² - 4ac = (${v.b})² - 4(${v.a})(${v.c}) = ${(v.b * v.b).toFixed(1)} - ${(4 * v.a * v.c).toFixed(1)} = ${delta.toFixed(2)}`,
          `x = (-(${v.b}) ± √(${delta.toFixed(2)})) / (2 × ${v.a})`,
          `Roots: ${rootStr}`,
        ],
        metrics: [
          { label: 'Discriminant (Δ)', symbol: 'Δ', value: delta.toFixed(2), unit: '', color: delta >= 0 ? 'emerald' : 'amber' },
          { label: 'Vertex H (-b/2a)', symbol: 'h', value: (-v.b / (2 * a)).toFixed(2), unit: '', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'pythagorean-theorem',
    title: 'Pythagorean Theorem',
    subject: 'math',
    category: 'Geometry',
    equation: 'c = √(a² + b²)',
    description: 'Calculates the hypotenuse c and interior angles of a right-angled triangle.',
    params: [
      { key: 'a', label: 'Side a', symbol: 'a', unit: 'cm', defaultVal: 3, min: 0.5, max: 50, step: 0.5, presets: [{ label: '3 (3-4-5)', value: 3 }, { label: '5 (5-12-13)', value: 5 }, { label: '8 cm', value: 8 }] },
      { key: 'b', label: 'Side b', symbol: 'b', unit: 'cm', defaultVal: 4, min: 0.5, max: 50, step: 0.5, presets: [{ label: '4 (3-4-5)', value: 4 }, { label: '12 (5-12-13)', value: 12 }, { label: '15 cm', value: 15 }] },
    ],
    calculate: (v) => {
      const c = Math.sqrt(v.a * v.a + v.b * v.b);
      const angleA = (Math.atan2(v.a, v.b) * 180) / Math.PI;
      const angleB = 90 - angleA;
      const area = 0.5 * v.a * v.b;

      return {
        primaryValue: c.toFixed(2),
        primaryUnit: 'cm',
        primarySymbol: 'c',
        substitutionSteps: [
          `c = √(a² + b²)`,
          `c = √(${v.a}² + ${v.b}²) = √(${(v.a * v.a).toFixed(1)} + ${(v.b * v.b).toFixed(1)}) = √(${(v.a * v.a + v.b * v.b).toFixed(1)})`,
          `c = ${c.toFixed(2)} cm`,
          `Angles: ∠A = ${angleA.toFixed(1)}°, ∠B = ${angleB.toFixed(1)}° | Area = ${area.toFixed(2)} cm²`,
        ],
        metrics: [
          { label: 'Hypotenuse (c)', symbol: 'c', value: c.toFixed(2), unit: 'cm', color: 'emerald' },
          { label: 'Triangle Area', symbol: 'A', value: area.toFixed(2), unit: 'cm²', color: 'amber' },
          { label: 'Angle A', symbol: '∠A', value: angleA.toFixed(1), unit: '°', color: 'cyan' },
        ],
      };
    },
    renderVisual: (v, r) => (
      <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
        <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
          <span>Right Triangle SVG</span>
          <span>c = {r.primaryValue}cm</span>
        </div>
        <svg viewBox="0 0 360 140" className="w-full h-auto">
          <polygon points="50,110 310,110 50,30" fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="2.5" />
          <rect x="50" y="96" width="14" height="14" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="180" y="128" fill="#38bdf8" fontSize="11" textAnchor="middle" fontFamily="monospace">b = {v.b}</text>
          <text x="35" y="70" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace">a = {v.a}</text>
          <text x="195" y="60" fill="#34d399" fontSize="11" fontWeight={700} textAnchor="middle" fontFamily="monospace">c = {r.primaryValue}</text>
        </svg>
      </div>
    ),
  },

  {
    id: 'circle-metrics',
    title: 'Circle Area & Circumference',
    subject: 'math',
    category: 'Geometry',
    equation: 'A = π · r², C = 2π · r',
    description: 'Computes geometric surface area, circumference, and diameter from radius r.',
    params: [
      { key: 'r', label: 'Radius', symbol: 'r', unit: 'm', defaultVal: 5, min: 0.1, max: 100, step: 0.5, presets: [{ label: '1 m', value: 1 }, { label: '5 m', value: 5 }, { label: '10 m', value: 10 }] },
    ],
    calculate: (v) => {
      const A = Math.PI * v.r * v.r;
      const C = 2 * Math.PI * v.r;
      return {
        primaryValue: A.toFixed(2),
        primaryUnit: 'm²',
        primarySymbol: 'A',
        substitutionSteps: [
          `Area A = π · r² = π × (${v.r})² = ${A.toFixed(2)} m²`,
          `Circumference C = 2 · π · r = 2 × π × ${v.r} = ${C.toFixed(2)} m`,
          `Diameter D = 2r = ${(v.r * 2).toFixed(2)} m`,
        ],
        metrics: [
          { label: 'Surface Area (A)', symbol: 'A', value: A.toFixed(2), unit: 'm²', color: 'emerald' },
          { label: 'Circumference (C)', symbol: 'C', value: C.toFixed(2), unit: 'm', color: 'indigo' },
          { label: 'Diameter (D)', symbol: 'D', value: (v.r * 2).toFixed(2), unit: 'm', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'unit-circle-trig',
    title: 'Unit Circle Trigonometry',
    subject: 'math',
    category: 'Trigonometry',
    equation: 'sin²(θ) + cos²(θ) = 1',
    description: 'Evaluates dynamic sine, cosine, and tangent coordinates across 360 degrees.',
    params: [
      { key: 'theta', label: 'Angle Theta (θ)', symbol: 'θ', unit: '°', defaultVal: 45, min: 0, max: 360, step: 1, presets: [{ label: '30°', value: 30 }, { label: '45°', value: 45 }, { label: '60°', value: 60 }, { label: '90°', value: 90 }, { label: '180°', value: 180 }] },
    ],
    calculate: (v) => {
      const rad = (v.theta * Math.PI) / 180;
      const sinVal = Math.sin(rad);
      const cosVal = Math.cos(rad);
      const tanVal = Math.abs(cosVal) < 0.001 ? Infinity : Math.tan(rad);

      return {
        primaryValue: `(${cosVal.toFixed(3)}, ${sinVal.toFixed(3)})`,
        primaryUnit: '',
        primarySymbol: '(x, y)',
        substitutionSteps: [
          `x = cos(${v.theta}°) = ${cosVal.toFixed(4)}`,
          `y = sin(${v.theta}°) = ${sinVal.toFixed(4)}`,
          `tan(${v.theta}°) = ${Math.abs(tanVal) > 1000 ? 'Undefined' : tanVal.toFixed(4)}`,
          `Identity Verification: sin²θ + cos²θ = ${(sinVal * sinVal + cosVal * cosVal).toFixed(4)} = 1`,
        ],
        metrics: [
          { label: 'Sine (sin θ)', symbol: 'sin', value: sinVal.toFixed(3), unit: '', color: 'emerald' },
          { label: 'Cosine (cos θ)', symbol: 'cos', value: cosVal.toFixed(3), unit: '', color: 'indigo' },
          { label: 'Tangent (tan θ)', symbol: 'tan', value: Math.abs(tanVal) > 100 ? '∞' : tanVal.toFixed(3), unit: '', color: 'amber' },
        ],
      };
    },
    renderVisual: (v) => {
      const rad = (v.theta * Math.PI) / 180;
      const cx = 180;
      const cy = 80;
      const r = 55;
      const px = cx + r * Math.cos(rad);
      const py = cy - r * Math.sin(rad);

      return (
        <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
            <span>Unit Circle Vector</span>
            <span>θ = {v.theta}°</span>
          </div>
          <svg viewBox="0 0 360 160" className="w-full h-auto">
            <line x1={cx - 70} y1={cy} x2={cx + 70} y2={cy} stroke="#3f3f46" strokeWidth="1" />
            <line x1={cx} y1={cy - 70} x2={cx} y2={cy + 70} stroke="#3f3f46" strokeWidth="1" />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth="2" />
            {/* Projections */}
            <line x1={cx} y1={cy} x2={px} y2={py} stroke="#38bdf8" strokeWidth="2" />
            <line x1={px} y1={cy} x2={px} y2={py} stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
            <line x1={cx} y1={cy} x2={px} y2={cy} stroke="#fbbf24" strokeWidth="2" />
            <circle cx={px} cy={py} r="4" fill="#f43f5e" />
          </svg>
        </div>
      );
    },
  },

  {
    id: 'sphere-metrics',
    title: 'Sphere Volume & Surface Area',
    subject: 'math',
    category: 'Geometry',
    equation: 'V = (4/3)π · r³, A = 4π · r²',
    description: 'Calculates the 3D volume capacity and total outer spherical surface area.',
    params: [
      { key: 'r', label: 'Radius', symbol: 'r', unit: 'cm', defaultVal: 6, min: 0.1, max: 50, step: 0.5, presets: [{ label: '1 cm', value: 1 }, { label: '6 cm', value: 6 }, { label: '15 cm', value: 15 }] },
    ],
    calculate: (v) => {
      const V = (4 / 3) * Math.PI * Math.pow(v.r, 3);
      const A = 4 * Math.PI * v.r * v.r;
      return {
        primaryValue: V.toFixed(2),
        primaryUnit: 'cm³',
        primarySymbol: 'V',
        substitutionSteps: [
          `Volume V = ⁴⁄₃ · π · r³ = ⁴⁄₃ × π × (${v.r})³ = ${V.toFixed(2)} cm³`,
          `Surface Area A = 4 · π · r² = 4 × π × (${v.r})² = ${A.toFixed(2)} cm²`,
        ],
        metrics: [
          { label: 'Volume (V)', symbol: 'V', value: V.toFixed(2), unit: 'cm³', color: 'emerald' },
          { label: 'Surface Area (A)', symbol: 'A', value: A.toFixed(2), unit: 'cm²', color: 'amber' },
        ],
      };
    },
  },

  {
    id: 'cylinder-volume',
    title: 'Cylinder Volume',
    subject: 'math',
    category: 'Geometry',
    equation: 'V = π · r² · h',
    description: 'Measures total volume and lateral surface area of a circular cylinder.',
    params: [
      { key: 'r', label: 'Base Radius', symbol: 'r', unit: 'cm', defaultVal: 4, min: 0.5, max: 40, step: 0.5, presets: [{ label: '2 cm', value: 2 }, { label: '4 cm', value: 4 }, { label: '10 cm', value: 10 }] },
      { key: 'h', label: 'Height', symbol: 'h', unit: 'cm', defaultVal: 12, min: 0.5, max: 100, step: 1, presets: [{ label: '5 cm', value: 5 }, { label: '12 cm', value: 12 }, { label: '30 cm', value: 30 }] },
    ],
    calculate: (v) => {
      const V = Math.PI * v.r * v.r * v.h;
      const lateralA = 2 * Math.PI * v.r * v.h;
      const totalA = lateralA + 2 * Math.PI * v.r * v.r;
      return {
        primaryValue: V.toFixed(2),
        primaryUnit: 'cm³',
        primarySymbol: 'V',
        substitutionSteps: [
          `V = π · r² · h = π × (${v.r})² × ${v.h}`,
          `V = π × ${(v.r * v.r).toFixed(1)} × ${v.h} = ${V.toFixed(2)} cm³`,
          `Total Surface Area = ${totalA.toFixed(2)} cm²`,
        ],
        metrics: [
          { label: 'Volume (V)', symbol: 'V', value: V.toFixed(2), unit: 'cm³', color: 'emerald' },
          { label: 'Lateral Area', symbol: 'A_lat', value: lateralA.toFixed(2), unit: 'cm²', color: 'indigo' },
          { label: 'Total Surface', symbol: 'A_tot', value: totalA.toFixed(2), unit: 'cm²', color: 'amber' },
        ],
      };
    },
  },

  {
    id: 'distance-formula-2d',
    title: 'Distance Formula (2D)',
    subject: 'math',
    category: 'Coordinate Geometry',
    equation: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
    description: 'Euclidean distance between two Cartesian coordinates (x₁, y₁) and (x₂, y₂).',
    params: [
      { key: 'x1', label: 'Point 1 X (x₁)', symbol: 'x₁', unit: '', defaultVal: 1, min: -20, max: 20, step: 0.5, presets: [{ label: '0', value: 0 }, { label: '1', value: 1 }] },
      { key: 'y1', label: 'Point 1 Y (y₁)', symbol: 'y₁', unit: '', defaultVal: 2, min: -20, max: 20, step: 0.5, presets: [{ label: '0', value: 0 }, { label: '2', value: 2 }] },
      { key: 'x2', label: 'Point 2 X (x₂)', symbol: 'x₂', unit: '', defaultVal: 4, min: -20, max: 20, step: 0.5, presets: [{ label: '4', value: 4 }, { label: '8', value: 8 }] },
      { key: 'y2', label: 'Point 2 Y (y₂)', symbol: 'y₂', unit: '', defaultVal: 6, min: -20, max: 20, step: 0.5, presets: [{ label: '6', value: 6 }, { label: '10', value: 10 }] },
    ],
    calculate: (v) => {
      const dx = v.x2 - v.x1;
      const dy = v.y2 - v.y1;
      const d = Math.sqrt(dx * dx + dy * dy);
      const midX = (v.x1 + v.x2) / 2;
      const midY = (v.y1 + v.y2) / 2;

      return {
        primaryValue: d.toFixed(3),
        primaryUnit: '',
        primarySymbol: 'd',
        substitutionSteps: [
          `d = √((x₂ - x₁)² + (y₂ - y₁)²)`,
          `d = √(((${v.x2}) - (${v.x1}))² + ((${v.y2}) - (${v.y1}))²)`,
          `d = √((${dx})² + (${dy})²) = √(${(dx * dx).toFixed(1)} + ${(dy * dy).toFixed(1)}) = ${d.toFixed(3)}`,
          `Midpoint: (${midX.toFixed(2)}, ${midY.toFixed(2)})`,
        ],
        metrics: [
          { label: 'Euclidean Distance', symbol: 'd', value: d.toFixed(3), unit: '', color: 'emerald' },
          { label: 'Midpoint X', symbol: 'mid_x', value: midX.toFixed(2), unit: '', color: 'cyan' },
          { label: 'Midpoint Y', symbol: 'mid_y', value: midY.toFixed(2), unit: '', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'slope-formula',
    title: 'Slope of a Line',
    subject: 'math',
    category: 'Coordinate Geometry',
    equation: 'm = (y₂ - y₁) / (x₂ - x₁)',
    description: 'Calculates the gradient slope m and inclination angle of a line between two points.',
    params: [
      { key: 'x1', label: 'Point 1 X', symbol: 'x₁', unit: '', defaultVal: 2, min: -20, max: 20, step: 1, presets: [{ label: '0', value: 0 }, { label: '2', value: 2 }] },
      { key: 'y1', label: 'Point 1 Y', symbol: 'y₁', unit: '', defaultVal: 3, min: -20, max: 20, step: 1, presets: [{ label: '0', value: 0 }, { label: '3', value: 3 }] },
      { key: 'x2', label: 'Point 2 X', symbol: 'x₂', unit: '', defaultVal: 6, min: -20, max: 20, step: 1, presets: [{ label: '5', value: 5 }, { label: '6', value: 6 }] },
      { key: 'y2', label: 'Point 2 Y', symbol: 'y₂', unit: '', defaultVal: 11, min: -20, max: 20, step: 1, presets: [{ label: '8', value: 8 }, { label: '11', value: 11 }] },
    ],
    calculate: (v) => {
      const dx = v.x2 - v.x1;
      const dy = v.y2 - v.y1;
      const isVertical = Math.abs(dx) < 0.0001;
      const m = isVertical ? Infinity : dy / dx;
      const angle = isVertical ? 90 : (Math.atan(m) * 180) / Math.PI;

      return {
        primaryValue: isVertical ? 'Undefined (Vertical)' : m.toFixed(2),
        primaryUnit: '',
        primarySymbol: 'm',
        substitutionSteps: [
          `m = (y₂ - y₁) / (x₂ - x₁)`,
          `m = (${v.y2} - ${v.y1}) / (${v.x2} - ${v.x1}) = ${dy} / ${dx}`,
          isVertical ? `Vertical line (division by zero)` : `m = ${m.toFixed(2)} (Angle: ${angle.toFixed(1)}°)`,
        ],
        metrics: [
          { label: 'Gradient Slope (m)', symbol: 'm', value: isVertical ? 'Undefined' : m.toFixed(2), unit: '', color: 'emerald' },
          { label: 'Angle of Inclination', symbol: 'θ', value: angle.toFixed(1), unit: '°', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'compound-interest',
    title: 'Compound Interest',
    subject: 'math',
    category: 'Financial Math',
    equation: 'A = P · (1 + r/n)^(n·t)',
    description: 'Calculates the future accumulated balance with periodic compound interest.',
    params: [
      { key: 'P', label: 'Principal', symbol: 'P', unit: '$', defaultVal: 1000, min: 10, max: 100000, step: 50, presets: [{ label: '$500', value: 500 }, { label: '$1,000', value: 1000 }, { label: '$10,000', value: 10000 }] },
      { key: 'r', label: 'Annual Rate', symbol: 'r', unit: '%', defaultVal: 7.0, min: 0.5, max: 30, step: 0.25, presets: [{ label: '3.5%', value: 3.5 }, { label: '7.0%', value: 7.0 }, { label: '10%', value: 10 }] },
      { key: 't', label: 'Years', symbol: 't', unit: 'yrs', defaultVal: 5, min: 1, max: 50, step: 1, presets: [{ label: '1 yr', value: 1 }, { label: '5 yrs', value: 5 }, { label: '10 yrs', value: 10 }, { label: '30 yrs', value: 30 }] },
      { key: 'n', label: 'Compounds / Year', symbol: 'n', unit: '', defaultVal: 12, min: 1, max: 365, step: 1, presets: [{ label: 'Annual (1)', value: 1 }, { label: 'Monthly (12)', value: 12 }, { label: 'Daily (365)', value: 365 }] },
    ],
    calculate: (v) => {
      const rateDecimal = v.r / 100;
      const A = v.P * Math.pow(1 + rateDecimal / v.n, v.n * v.t);
      const interestEarned = A - v.P;

      return {
        primaryValue: `$${A.toFixed(2)}`,
        primaryUnit: '',
        primarySymbol: 'A',
        substitutionSteps: [
          `A = P · (1 + r/n)^(n·t)`,
          `A = ${v.P} × (1 + ${(rateDecimal).toFixed(4)} / ${v.n})^(${v.n} × ${v.t})`,
          `Final Amount A = $${A.toFixed(2)}`,
          `Total Interest Earned = $${interestEarned.toFixed(2)}`,
        ],
        metrics: [
          { label: 'Future Value (A)', symbol: 'A', value: `$${A.toFixed(2)}`, unit: '', color: 'emerald' },
          { label: 'Total Interest', symbol: 'I', value: `$${interestEarned.toFixed(2)}`, unit: '', color: 'amber' },
        ],
      };
    },
  },

  {
    id: 'simple-interest',
    title: 'Simple Interest',
    subject: 'math',
    category: 'Financial Math',
    equation: 'I = P · r · t',
    description: 'Calculates non-compounding linear interest on a loan or investment.',
    params: [
      { key: 'P', label: 'Principal', symbol: 'P', unit: '$', defaultVal: 5000, min: 50, max: 100000, step: 100, presets: [{ label: '$1,000', value: 1000 }, { label: '$5,000', value: 5000 }, { label: '$20,000', value: 20000 }] },
      { key: 'r', label: 'Annual Rate', symbol: 'r', unit: '%', defaultVal: 5.0, min: 0.1, max: 30, step: 0.1, presets: [{ label: '3%', value: 3 }, { label: '5%', value: 5 }, { label: '8%', value: 8 }] },
      { key: 't', label: 'Time', symbol: 't', unit: 'yrs', defaultVal: 3, min: 0.5, max: 30, step: 0.5, presets: [{ label: '1 yr', value: 1 }, { label: '3 yrs', value: 3 }, { label: '5 yrs', value: 5 }] },
    ],
    calculate: (v) => {
      const rateDecimal = v.r / 100;
      const I = v.P * rateDecimal * v.t;
      const total = v.P + I;

      return {
        primaryValue: `$${I.toFixed(2)}`,
        primaryUnit: '',
        primarySymbol: 'I',
        substitutionSteps: [
          `I = P · r · t`,
          `I = $${v.P} × ${(rateDecimal).toFixed(3)} × ${v.t} yrs`,
          `I = $${I.toFixed(2)}`,
          `Total Maturity Value = $${v.P} + $${I.toFixed(2)} = $${total.toFixed(2)}`,
        ],
        metrics: [
          { label: 'Interest (I)', symbol: 'I', value: `$${I.toFixed(2)}`, unit: '', color: 'emerald' },
          { label: 'Total Value', symbol: 'A', value: `$${total.toFixed(2)}`, unit: '', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'ap-sum',
    title: 'Arithmetic Progression Sum',
    subject: 'math',
    category: 'Sequences & Series',
    equation: 'S_n = (n/2) · (2a + (n - 1)d)',
    description: 'Calculates the total summation of n terms in an arithmetic progression.',
    params: [
      { key: 'n', label: 'Number of terms (n)', symbol: 'n', unit: '', defaultVal: 10, min: 1, max: 100, step: 1, presets: [{ label: '5 terms', value: 5 }, { label: '10 terms', value: 10 }, { label: '50 terms', value: 50 }] },
      { key: 'a', label: 'First term (a)', symbol: 'a', unit: '', defaultVal: 3, min: -50, max: 100, step: 1, presets: [{ label: 'a = 1', value: 1 }, { label: 'a = 3', value: 3 }] },
      { key: 'd', label: 'Common difference (d)', symbol: 'd', unit: '', defaultVal: 4, min: -20, max: 50, step: 1, presets: [{ label: 'd = 2', value: 2 }, { label: 'd = 4', value: 4 }] },
    ],
    calculate: (v) => {
      const Sn = (v.n / 2) * (2 * v.a + (v.n - 1) * v.d);
      const nthTerm = v.a + (v.n - 1) * v.d;

      return {
        primaryValue: Sn.toFixed(0),
        primaryUnit: '',
        primarySymbol: 'S_n',
        substitutionSteps: [
          `S_n = (n / 2) · [2a + (n - 1)d]`,
          `S_${v.n} = (${v.n} / 2) · [2(${v.a}) + (${v.n} - 1)(${v.d})]`,
          `S_${v.n} = ${(v.n / 2)} · [${2 * v.a} + ${(v.n - 1) * v.d}] = ${Sn.toFixed(0)}`,
          `N-th term a_${v.n} = ${nthTerm}`,
        ],
        metrics: [
          { label: 'Series Sum (S_n)', symbol: 'S_n', value: Sn.toFixed(0), unit: '', color: 'emerald' },
          { label: 'Last Term (a_n)', symbol: 'a_n', value: nthTerm.toFixed(0), unit: '', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'gp-sum',
    title: 'Geometric Progression Sum',
    subject: 'math',
    category: 'Sequences & Series',
    equation: 'S_n = a · (1 - r^n) / (1 - r)',
    description: 'Calculates the sum of first n terms in a geometric progression with common ratio r.',
    params: [
      { key: 'a', label: 'First term (a)', symbol: 'a', unit: '', defaultVal: 2, min: 0.1, max: 50, step: 0.5, presets: [{ label: 'a = 1', value: 1 }, { label: 'a = 2', value: 2 }] },
      { key: 'r', label: 'Common ratio (r)', symbol: 'r', unit: '', defaultVal: 2, min: 0.1, max: 10, step: 0.1, presets: [{ label: 'r = 0.5', value: 0.5 }, { label: 'r = 2', value: 2 }, { label: 'r = 3', value: 3 }] },
      { key: 'n', label: 'Terms (n)', symbol: 'n', unit: '', defaultVal: 6, min: 1, max: 20, step: 1, presets: [{ label: '4 terms', value: 4 }, { label: '6 terms', value: 6 }, { label: '10 terms', value: 10 }] },
    ],
    calculate: (v) => {
      let Sn = 0;
      if (Math.abs(v.r - 1) < 0.0001) {
        Sn = v.a * v.n;
      } else {
        Sn = (v.a * (1 - Math.pow(v.r, v.n))) / (1 - v.r);
      }

      return {
        primaryValue: Sn.toFixed(2),
        primaryUnit: '',
        primarySymbol: 'S_n',
        substitutionSteps: [
          `S_n = a · (1 - r^n) / (1 - r)`,
          `S_${v.n} = ${v.a} · (1 - ${v.r}^${v.n}) / (1 - ${v.r})`,
          `S_${v.n} = ${Sn.toFixed(2)}`,
        ],
        metrics: [
          { label: 'Geometric Sum (S_n)', symbol: 'S_n', value: Sn.toFixed(2), unit: '', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'herons-formula',
    title: "Triangle Area (Heron's Formula)",
    subject: 'math',
    category: 'Geometry',
    equation: 'A = √(s(s-a)(s-b)(s-c))',
    description: 'Computes triangle area directly from three side lengths using semiperimeter s.',
    params: [
      { key: 'a', label: 'Side a', symbol: 'a', unit: 'cm', defaultVal: 5, min: 1, max: 50, step: 0.5, presets: [{ label: '5 cm', value: 5 }, { label: '7 cm', value: 7 }] },
      { key: 'b', label: 'Side b', symbol: 'b', unit: 'cm', defaultVal: 6, min: 1, max: 50, step: 0.5, presets: [{ label: '6 cm', value: 6 }, { label: '8 cm', value: 8 }] },
      { key: 'c', label: 'Side c', symbol: 'c', unit: 'cm', defaultVal: 7, min: 1, max: 50, step: 0.5, presets: [{ label: '7 cm', value: 7 }, { label: '9 cm', value: 9 }] },
    ],
    calculate: (v) => {
      const s = (v.a + v.b + v.c) / 2;
      const prod = s * (s - v.a) * (s - v.b) * (s - v.c);
      const isValidTriangle = prod > 0 && v.a + v.b > v.c && v.a + v.c > v.b && v.b + v.c > v.a;
      const A = isValidTriangle ? Math.sqrt(prod) : 0;

      return {
        primaryValue: isValidTriangle ? A.toFixed(2) : 'Invalid Triangle',
        primaryUnit: isValidTriangle ? 'cm²' : '',
        primarySymbol: 'A',
        substitutionSteps: [
          `Semiperimeter s = (a + b + c) / 2 = (${v.a} + ${v.b} + ${v.c}) / 2 = ${s.toFixed(1)} cm`,
          `A = √(s · (s - a) · (s - b) · (s - c))`,
          isValidTriangle
            ? `A = √(${s.toFixed(1)} × ${(s - v.a).toFixed(1)} × ${(s - v.b).toFixed(1)} × ${(s - v.c).toFixed(1)}) = ${A.toFixed(2)} cm²`
            : `Triangle inequality violated: sides cannot form a triangle.`,
        ],
        metrics: [
          { label: 'Area (A)', symbol: 'A', value: isValidTriangle ? A.toFixed(2) : 'N/A', unit: 'cm²', color: 'emerald' },
          { label: 'Semiperimeter (s)', symbol: 's', value: s.toFixed(1), unit: 'cm', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'permutations',
    title: 'Permutations Formula',
    subject: 'math',
    category: 'Combinatorics',
    equation: 'P(n, k) = n! / (n - k)!',
    description: 'Calculates the number of ordered arrangements of k items chosen from n elements.',
    params: [
      { key: 'n', label: 'Total items (n)', symbol: 'n', unit: '', defaultVal: 6, min: 1, max: 15, step: 1, presets: [{ label: 'n = 5', value: 5 }, { label: 'n = 6', value: 6 }, { label: 'n = 10', value: 10 }] },
      { key: 'k', label: 'Items chosen (k)', symbol: 'k', unit: '', defaultVal: 3, min: 0, max: 15, step: 1, presets: [{ label: 'k = 2', value: 2 }, { label: 'k = 3', value: 3 }, { label: 'k = 5', value: 5 }] },
    ],
    calculate: (v) => {
      const n = Math.floor(v.n);
      const k = Math.min(n, Math.floor(v.k));
      const pVal = factorial(n) / factorial(n - k);

      return {
        primaryValue: pVal.toLocaleString(),
        primaryUnit: 'ways',
        primarySymbol: 'P(n, k)',
        substitutionSteps: [
          `P(n, k) = n! / (n - k)!`,
          `P(${n}, ${k}) = ${n}! / (${n} - ${k})! = ${factorial(n)} / ${factorial(n - k)}`,
          `P(${n}, ${k}) = ${pVal.toLocaleString()} ordered permutations`,
        ],
        metrics: [
          { label: 'Permutations P(n,k)', symbol: 'P', value: pVal.toLocaleString(), unit: 'ways', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'combinations',
    title: 'Combinations Formula',
    subject: 'math',
    category: 'Combinatorics',
    equation: 'C(n, k) = n! / (k! · (n - k)!)',
    description: 'Calculates the number of unordered selections of k items chosen from n elements.',
    params: [
      { key: 'n', label: 'Total items (n)', symbol: 'n', unit: '', defaultVal: 8, min: 1, max: 20, step: 1, presets: [{ label: 'n = 5', value: 5 }, { label: 'n = 8', value: 8 }, { label: 'n = 12', value: 12 }] },
      { key: 'k', label: 'Items chosen (k)', symbol: 'k', unit: '', defaultVal: 3, min: 0, max: 20, step: 1, presets: [{ label: 'k = 2', value: 2 }, { label: 'k = 3', value: 3 }, { label: 'k = 4', value: 4 }] },
    ],
    calculate: (v) => {
      const n = Math.floor(v.n);
      const k = Math.min(n, Math.floor(v.k));
      const cVal = factorial(n) / (factorial(k) * factorial(n - k));

      return {
        primaryValue: cVal.toLocaleString(),
        primaryUnit: 'combinations',
        primarySymbol: 'C(n, k)',
        substitutionSteps: [
          `C(n, k) = n! / (k! · (n - k)!)`,
          `C(${n}, ${k}) = ${n}! / (${k}! · (${n} - ${k})!)`,
          `C(${n}, ${k}) = ${factorial(n)} / (${factorial(k)} × ${factorial(n - k)}) = ${cVal.toLocaleString()}`,
        ],
        metrics: [
          { label: 'Combinations C(n,k)', symbol: 'C', value: cVal.toLocaleString(), unit: 'ways', color: 'emerald' },
        ],
      };
    },
  },

  // ==========================================
  // CHEMISTRY (31 - 40)
  // ==========================================
  {
    id: 'ideal-gas-law',
    title: 'Ideal Gas Law',
    subject: 'chemistry',
    category: 'Thermodynamics',
    equation: 'P = (n · R · T) / V',
    description: 'Calculates pressure, volume, moles, and temperature of an ideal gas.',
    params: [
      { key: 'n', label: 'Moles (n)', symbol: 'n', unit: 'mol', defaultVal: 1.0, min: 0.1, max: 10, step: 0.1, presets: [{ label: '0.5 mol', value: 0.5 }, { label: '1.0 mol', value: 1.0 }, { label: '2.0 mol', value: 2.0 }] },
      { key: 'T', label: 'Temperature (T)', symbol: 'T', unit: 'K', defaultVal: 300, min: 100, max: 800, step: 5, presets: [{ label: '273K (0°C)', value: 273.15 }, { label: '300K (27°C)', value: 300 }, { label: '373K (100°C)', value: 373.15 }] },
      { key: 'V', label: 'Volume (V)', symbol: 'V', unit: 'L', defaultVal: 10.0, min: 1.0, max: 50, step: 0.5, presets: [{ label: '5 L', value: 5 }, { label: '10 L', value: 10 }, { label: '22.4 L (STP)', value: 22.4 }] },
    ],
    calculate: (v) => {
      const R = 0.08206; // L·atm/(mol·K)
      const P = (v.n * R * v.T) / Math.max(0.1, v.V);
      const pKPa = P * 101.325;

      return {
        primaryValue: P.toFixed(2),
        primaryUnit: 'atm',
        primarySymbol: 'P',
        substitutionSteps: [
          `P = (n · R · T) / V (R = 0.08206 L·atm/(mol·K))`,
          `P = (${v.n} mol × 0.08206 × ${v.T} K) / ${v.V} L`,
          `P = ${P.toFixed(3)} atm (${pKPa.toFixed(1)} kPa)`,
        ],
        metrics: [
          { label: 'Pressure (atm)', symbol: 'P', value: P.toFixed(2), unit: 'atm', color: 'emerald' },
          { label: 'Pressure (kPa)', symbol: 'P_kPa', value: pKPa.toFixed(1), unit: 'kPa', color: 'indigo' },
        ],
      };
    },
    renderVisual: (v, r) => {
      const pistonY = 30 + (1 - Math.min(1, v.V / 40)) * 60;
      return (
        <div className="w-full bg-zinc-950 rounded-xl p-3 border border-zinc-800">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono mb-2 pb-1 border-b border-zinc-800">
            <span>Piston Chamber Volume & Pressure</span>
            <span>P = {r.primaryValue} atm</span>
          </div>
          <svg viewBox="0 0 360 140" className="w-full h-auto">
            {/* Cylinder */}
            <rect x="110" y="20" width="140" height="100" rx="4" fill="#18181b" stroke="#64748b" strokeWidth="2" />
            {/* Piston head */}
            <rect x="112" y={pistonY} width="136" height="12" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="180" y1="10" x2="180" y2={pistonY} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            {/* Gas particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} cx={125 + (i % 4) * 32} cy={pistonY + 20 + Math.floor(i / 4) * 20} r="3" fill="#f59e0b" />
            ))}
            <text x="180" y="132" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">V = {v.V} L | T = {v.T} K</text>
          </svg>
        </div>
      );
    },
  },

  {
    id: 'boyles-law',
    title: "Boyle's Law",
    subject: 'chemistry',
    category: 'Gas Laws',
    equation: 'P₂ = (P₁ · V₁) / V₂',
    description: 'Inverse relationship between pressure and volume of a gas at constant temperature.',
    params: [
      { key: 'P1', label: 'Initial Pressure (P₁)', symbol: 'P₁', unit: 'atm', defaultVal: 1.0, min: 0.1, max: 20, step: 0.1, presets: [{ label: '1 atm', value: 1 }, { label: '2 atm', value: 2 }] },
      { key: 'V1', label: 'Initial Volume (V₁)', symbol: 'V₁', unit: 'L', defaultVal: 10.0, min: 0.5, max: 50, step: 0.5, presets: [{ label: '5 L', value: 5 }, { label: '10 L', value: 10 }] },
      { key: 'V2', label: 'Final Volume (V₂)', symbol: 'V₂', unit: 'L', defaultVal: 5.0, min: 0.5, max: 50, step: 0.5, presets: [{ label: '2 L', value: 2 }, { label: '5 L', value: 5 }, { label: '20 L', value: 20 }] },
    ],
    calculate: (v) => {
      const P2 = (v.P1 * v.V1) / Math.max(0.01, v.V2);
      return {
        primaryValue: P2.toFixed(2),
        primaryUnit: 'atm',
        primarySymbol: 'P₂',
        substitutionSteps: [
          `P₁ · V₁ = P₂ · V₂ => P₂ = (P₁ · V₁) / V₂`,
          `P₂ = (${v.P1} atm × ${v.V1} L) / ${v.V2} L`,
          `P₂ = ${P2.toFixed(2)} atm`,
        ],
        metrics: [
          { label: 'Final Pressure (P₂)', symbol: 'P₂', value: P2.toFixed(2), unit: 'atm', color: 'emerald' },
          { label: 'Compression Ratio', symbol: 'V₁/V₂', value: (v.V1 / v.V2).toFixed(2), unit: 'x', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'charles-law',
    title: "Charles's Law",
    subject: 'chemistry',
    category: 'Gas Laws',
    equation: 'V₂ = (V₁ · T₂) / T₁',
    description: 'Direct relationship between gas volume and absolute temperature at constant pressure.',
    params: [
      { key: 'V1', label: 'Initial Volume (V₁)', symbol: 'V₁', unit: 'L', defaultVal: 4.0, min: 0.5, max: 50, step: 0.5, presets: [{ label: '2 L', value: 2 }, { label: '4 L', value: 4 }] },
      { key: 'T1', label: 'Initial Temp (T₁)', symbol: 'T₁', unit: 'K', defaultVal: 300, min: 100, max: 600, step: 5, presets: [{ label: '273 K', value: 273 }, { label: '300 K', value: 300 }] },
      { key: 'T2', label: 'Final Temp (T₂)', symbol: 'T₂', unit: 'K', defaultVal: 450, min: 100, max: 800, step: 5, presets: [{ label: '373 K', value: 373 }, { label: '450 K', value: 450 }] },
    ],
    calculate: (v) => {
      const V2 = (v.V1 * v.T2) / Math.max(1, v.T1);
      return {
        primaryValue: V2.toFixed(2),
        primaryUnit: 'L',
        primarySymbol: 'V₂',
        substitutionSteps: [
          `V₁ / T₁ = V₂ / T₂ => V₂ = (V₁ · T₂) / T₁`,
          `V₂ = (${v.V1} L × ${v.T2} K) / ${v.T1} K`,
          `V₂ = ${V2.toFixed(2)} L`,
        ],
        metrics: [
          { label: 'Expanded Volume (V₂)', symbol: 'V₂', value: V2.toFixed(2), unit: 'L', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'molarity-formula',
    title: 'Molarity Calculation',
    subject: 'chemistry',
    category: 'Solutions',
    equation: 'M = moles / Volume (L)',
    description: 'Calculates molar concentration of a dissolved solute per liter of solution.',
    params: [
      { key: 'moles', label: 'Moles of Solute', symbol: 'n', unit: 'mol', defaultVal: 0.5, min: 0.01, max: 10, step: 0.05, presets: [{ label: '0.1 mol', value: 0.1 }, { label: '0.5 mol', value: 0.5 }, { label: '1.0 mol', value: 1.0 }] },
      { key: 'volume', label: 'Solution Volume', symbol: 'V', unit: 'L', defaultVal: 2.0, min: 0.1, max: 50, step: 0.1, presets: [{ label: '0.5 L', value: 0.5 }, { label: '1.0 L', value: 1.0 }, { label: '2.0 L', value: 2.0 }] },
    ],
    calculate: (v) => {
      const M = v.moles / Math.max(0.01, v.volume);
      return {
        primaryValue: M.toFixed(3),
        primaryUnit: 'M',
        primarySymbol: 'M',
        substitutionSteps: [
          `M = moles of solute / volume in liters`,
          `M = ${v.moles} mol / ${v.volume} L`,
          `M = ${M.toFixed(3)} mol/L (Molar)`,
        ],
        metrics: [
          { label: 'Molarity (M)', symbol: 'M', value: M.toFixed(3), unit: 'mol/L', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'dilution-equation',
    title: 'Dilution Equation',
    subject: 'chemistry',
    category: 'Solutions',
    equation: 'M₁ · V₁ = M₂ · V₂',
    description: 'Calculates necessary stock volume or final concentration upon dilution.',
    params: [
      { key: 'M1', label: 'Stock Concentration (M₁)', symbol: 'M₁', unit: 'M', defaultVal: 12.0, min: 0.1, max: 20, step: 0.5, presets: [{ label: '1 M', value: 1 }, { label: '6 M', value: 6 }, { label: '12 M (Conc)', value: 12 }] },
      { key: 'V1', label: 'Stock Volume (V₁)', symbol: 'V₁', unit: 'mL', defaultVal: 25.0, min: 1, max: 500, step: 1, presets: [{ label: '10 mL', value: 10 }, { label: '25 mL', value: 25 }, { label: '50 mL', value: 50 }] },
      { key: 'V2', label: 'Target Final Volume (V₂)', symbol: 'V₂', unit: 'mL', defaultVal: 250.0, min: 10, max: 2000, step: 10, presets: [{ label: '100 mL', value: 100 }, { label: '250 mL', value: 250 }, { label: '500 mL', value: 500 }] },
    ],
    calculate: (v) => {
      const M2 = (v.M1 * v.V1) / Math.max(1, v.V2);
      return {
        primaryValue: M2.toFixed(3),
        primaryUnit: 'M',
        primarySymbol: 'M₂',
        substitutionSteps: [
          `M₁ · V₁ = M₂ · V₂ => M₂ = (M₁ · V₁) / V₂`,
          `M₂ = (${v.M1} M × ${v.V1} mL) / ${v.V2} mL`,
          `M₂ = ${M2.toFixed(3)} M`,
          `Dilution Factor = ${(v.V2 / v.V1).toFixed(1)}x`,
        ],
        metrics: [
          { label: 'Final Molarity (M₂)', symbol: 'M₂', value: M2.toFixed(3), unit: 'M', color: 'emerald' },
          { label: 'Dilution Factor', symbol: 'DF', value: (v.V2 / v.V1).toFixed(1), unit: 'x', color: 'indigo' },
        ],
      };
    },
  },

  {
    id: 'ph-calculation',
    title: 'pH Calculation',
    subject: 'chemistry',
    category: 'Acids & Bases',
    equation: 'pH = -log₁₀[H⁺]',
    description: 'Calculates acidity, alkalinity, pOH, and [H⁺]/[OH⁻] molar concentrations across the 0–14 pH scale.',
    params: [
      {
        key: 'negLogH',
        label: 'pH Index / -log₁₀[H⁺]',
        symbol: 'pH',
        unit: '',
        defaultVal: 7.0,
        min: 0.0,
        max: 14.0,
        step: 0.01,
        presets: [
          { label: 'Battery Acid (1.0)', value: 1.0 },
          { label: 'Gastric Acid (1.5)', value: 1.5 },
          { label: 'Black Coffee (5.0)', value: 5.0 },
          { label: 'Pure Water (7.0)', value: 7.0 },
          { label: 'Soapy Water (12.0)', value: 12.0 },
          { label: 'Bleach (12.5)', value: 12.5 },
        ],
      },
    ],
    calculate: (v) => {
      const pH = Math.max(0, Math.min(14, v.negLogH ?? 7.0));
      const pOH = 14.0 - pH;
      const hConc = Math.pow(10, -pH);
      const ohConc = Math.pow(10, -pOH);

      // Classification
      let classification = 'Neutral';
      let classColor = 'emerald';
      if (pH < 6.8) {
        classification = pH < 3.0 ? 'Strongly Acidic' : 'Weakly Acidic';
        classColor = 'rose';
      } else if (pH > 7.2) {
        classification = pH > 11.0 ? 'Strongly Alkaline' : 'Weakly Alkaline';
        classColor = 'indigo';
      }

      const formatSci = (num: number) => {
        const exp = Math.floor(Math.log10(num));
        const coeff = (num / Math.pow(10, exp)).toFixed(2);
        return `${coeff} × 10^(${exp}) M`;
      };

      return {
        primaryValue: pH.toFixed(2),
        primaryUnit: '',
        primarySymbol: 'pH',
        substitutionSteps: [
          `Given [H⁺] = ${formatSci(hConc)} (${hConc.toExponential(2)} M)`,
          `pH = -log₁₀[H⁺] = -log₁₀(${hConc.toExponential(2)}) = ${pH.toFixed(2)}`,
          `pOH = 14.00 - pH = 14.00 - ${pH.toFixed(2)} = ${pOH.toFixed(2)}`,
          `[OH⁻] = 10^(-pOH) = 10^(-${pOH.toFixed(2)}) = ${formatSci(ohConc)} (${ohConc.toExponential(2)} M)`,
          `Ion Product Kw = [H⁺][OH⁻] = 1.00 × 10^(-14)`,
          `Solution Nature: ${classification}`,
        ],
        metrics: [
          { label: 'pH Value', symbol: 'pH', value: pH.toFixed(2), unit: '', color: classColor },
          { label: 'pOH Value', symbol: 'pOH', value: pOH.toFixed(2), unit: '', color: 'cyan' },
          { label: '[H⁺] Concentration', symbol: '[H⁺]', value: hConc.toExponential(2), unit: 'M', color: 'rose' },
          { label: '[OH⁻] Concentration', symbol: '[OH⁻]', value: ohConc.toExponential(2), unit: 'M', color: 'indigo' },
          { label: 'Classification', symbol: 'Type', value: classification, unit: '', color: classColor },
        ],
      };
    },
    renderVisual: (v) => {
      const pH = Math.max(0, Math.min(14, v.negLogH ?? 7.0));
      const pOH = 14 - pH;
      const hConc = Math.pow(10, -pH);
      const isAcidic = pH < 6.9;
      const isBasic = pH > 7.1;
      const nature = isAcidic ? 'Acidic' : isBasic ? 'Alkaline / Basic' : 'Neutral';
      const pct = (pH / 14) * 100;

      return (
        <div className="w-full bg-zinc-950 rounded-2xl p-4 sm:p-5 border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono pb-2 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
              <span>Dynamic 0–14 pH Spectrum Bar</span>
            </span>
            <span className="font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-white font-bold">
              pH {pH.toFixed(2)} • {nature}
            </span>
          </div>

          {/* Continuous Spectrum Bar */}
          <div className="space-y-1.5">
            <div className="relative w-full h-8 sm:h-9 rounded-xl overflow-visible border-2 border-zinc-700 bg-gradient-to-r from-red-600 via-orange-500 via-yellow-400 via-green-500 via-teal-400 via-blue-600 to-purple-800 shadow-inner">
              {/* Active Pointer Needle */}
              <div
                className="absolute -top-1.5 bottom-[-6px] w-3 bg-white border-2 border-zinc-950 rounded-md shadow-2xl transition-all duration-150 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                style={{ left: `${pct}%` }}
              >
                <div className="w-1 h-4 bg-zinc-900 rounded-full" />
              </div>
            </div>

            {/* Scale numbers */}
            <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-400 px-1 pt-1">
              <span className="text-red-400">0 (Strong Acid)</span>
              <span className="text-amber-300">3</span>
              <span className="text-green-400">7 (Neutral)</span>
              <span className="text-cyan-300">10</span>
              <span className="text-purple-400">14 (Strong Base)</span>
            </div>
          </div>

          {/* Quick Dual-Ion Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800 font-mono">
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-red-400 font-bold uppercase block">[H⁺] Ion</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{hConc.toExponential(2)} M</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block">[OH⁻] Ion</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{Math.pow(10, -pOH).toExponential(2)} M</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">pH Value</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{pH.toFixed(2)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-[10px] text-indigo-400 font-bold uppercase block">pOH Value</span>
              <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block">{pOH.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    },
  },

  {
    id: 'density-formula',
    title: 'Density Formula',
    subject: 'chemistry',
    category: 'Properties',
    equation: 'ρ = m / V',
    description: 'Calculates density mass-to-volume ratio of materials and compares against water.',
    params: [
      { key: 'm', label: 'Mass', symbol: 'm', unit: 'g', defaultVal: 54.0, min: 1, max: 1000, step: 1, presets: [{ label: '10 g', value: 10 }, { label: '54 g', value: 54 }, { label: '193 g (Gold)', value: 193 }] },
      { key: 'V', label: 'Volume', symbol: 'V', unit: 'cm³', defaultVal: 20.0, min: 1, max: 500, step: 1, presets: [{ label: '10 cm³', value: 10 }, { label: '20 cm³', value: 20 }, { label: '50 cm³', value: 50 }] },
    ],
    calculate: (v) => {
      const rho = v.m / Math.max(0.1, v.V);
      const floatsOnWater = rho < 1.0;

      return {
        primaryValue: rho.toFixed(2),
        primaryUnit: 'g/cm³',
        primarySymbol: 'ρ',
        substitutionSteps: [
          `ρ = m / V`,
          `ρ = ${v.m} g / ${v.V} cm³`,
          `ρ = ${rho.toFixed(3)} g/cm³ (${(rho * 1000).toFixed(0)} kg/m³)`,
          `Behavior in water (ρ=1.0): ${floatsOnWater ? 'Floats' : 'Sinks'}`,
        ],
        metrics: [
          { label: 'Density (ρ)', symbol: 'ρ', value: rho.toFixed(2), unit: 'g/cm³', color: 'emerald' },
          { label: 'Density in kg/m³', symbol: 'kg/m³', value: (rho * 1000).toFixed(0), unit: 'kg/m³', color: 'indigo' },
          { label: 'Buoyancy', symbol: 'state', value: floatsOnWater ? 'Floats' : 'Sinks', unit: '', color: floatsOnWater ? 'cyan' : 'amber' },
        ],
      };
    },
  },

  {
    id: 'radioactive-decay',
    title: 'Radioactive Half-Life Decay',
    subject: 'chemistry',
    category: 'Nuclear Chemistry',
    equation: 'N(t) = N₀ · (½)^(t / t_½)',
    description: 'Exponential decay model for isotope remaining mass and activity over elapsed time.',
    params: [
      { key: 'N0', label: 'Initial Amount (N₀)', symbol: 'N₀', unit: 'g', defaultVal: 100, min: 1, max: 1000, step: 5, presets: [{ label: '50 g', value: 50 }, { label: '100 g', value: 100 }] },
      { key: 't', label: 'Elapsed Time (t)', symbol: 't', unit: 'yrs', defaultVal: 15, min: 1, max: 100, step: 1, presets: [{ label: '5 yrs', value: 5 }, { label: '15 yrs', value: 15 }, { label: '30 yrs', value: 30 }] },
      { key: 'tHalf', label: 'Half-Life (t_½)', symbol: 't_½', unit: 'yrs', defaultVal: 5.73, min: 0.1, max: 50, step: 0.1, presets: [{ label: 'C-14 (5.73k)', value: 5.73 }, { label: 'Co-60 (5.27)', value: 5.27 }, { label: 'Cs-137 (30.1)', value: 30.1 }] },
    ],
    calculate: (v) => {
      const halfLives = v.t / Math.max(0.01, v.tHalf);
      const Nt = v.N0 * Math.pow(0.5, halfLives);
      const percentRemaining = (Nt / v.N0) * 100;

      return {
        primaryValue: Nt.toFixed(2),
        primaryUnit: 'g',
        primarySymbol: 'N(t)',
        substitutionSteps: [
          `N(t) = N₀ · (½)^(t / t_½)`,
          `Number of half-lives = ${v.t} / ${v.tHalf} = ${halfLives.toFixed(2)}`,
          `N(t) = ${v.N0} × (0.5)^(${halfLives.toFixed(2)}) = ${Nt.toFixed(2)} g`,
          `Remaining: ${percentRemaining.toFixed(1)}%`,
        ],
        metrics: [
          { label: 'Remaining Mass', symbol: 'N(t)', value: Nt.toFixed(2), unit: 'g', color: 'emerald' },
          { label: 'Half-lives Elapsed', symbol: 'n', value: halfLives.toFixed(2), unit: '', color: 'indigo' },
          { label: '% Remaining', symbol: '%', value: percentRemaining.toFixed(1), unit: '%', color: 'cyan' },
        ],
      };
    },
  },

  {
    id: 'grahams-law',
    title: "Graham's Law of Effusion",
    subject: 'chemistry',
    category: 'Gas Laws',
    equation: 'Rate₁ / Rate₂ = √(M₂ / M₁)',
    description: 'Relative rate of gas effusion inversely proportional to square root of molar mass.',
    params: [
      { key: 'M1', label: 'Gas 1 Molar Mass (M₁)', symbol: 'M₁', unit: 'g/mol', defaultVal: 2.02, min: 1, max: 200, step: 0.5, presets: [{ label: 'H₂ (2.02)', value: 2.02 }, { label: 'He (4.00)', value: 4.0 }, { label: 'CH₄ (16.0)', value: 16.0 }] },
      { key: 'M2', label: 'Gas 2 Molar Mass (M₂)', symbol: 'M₂', unit: 'g/mol', defaultVal: 32.0, min: 1, max: 200, step: 0.5, presets: [{ label: 'O₂ (32.0)', value: 32.0 }, { label: 'CO₂ (44.0)', value: 44.0 }] },
    ],
    calculate: (v) => {
      const ratio = Math.sqrt(v.M2 / Math.max(0.1, v.M1));
      return {
        primaryValue: ratio.toFixed(2),
        primaryUnit: 'x faster',
        primarySymbol: 'r₁/r₂',
        substitutionSteps: [
          `Rate₁ / Rate₂ = √(M₂ / M₁)`,
          `Rate₁ / Rate₂ = √(${v.M2} / ${v.M1}) = √(${(v.M2 / v.M1).toFixed(2)})`,
          `Gas 1 effuses ${ratio.toFixed(2)} times faster than Gas 2.`,
        ],
        metrics: [
          { label: 'Effusion Rate Ratio', symbol: 'r₁/r₂', value: ratio.toFixed(2), unit: 'x', color: 'emerald' },
        ],
      };
    },
  },

  {
    id: 'heat-calorimetry',
    title: 'Heat Energy (Calorimetry)',
    subject: 'chemistry',
    category: 'Thermodynamics',
    equation: 'q = m · c · ΔT',
    description: 'Thermal energy transferred to a substance based on mass, specific heat, and temperature change.',
    params: [
      { key: 'm', label: 'Mass', symbol: 'm', unit: 'g', defaultVal: 250, min: 1, max: 2000, step: 10, presets: [{ label: '100 g', value: 100 }, { label: '250 g', value: 250 }, { label: '1000 g', value: 1000 }] },
      { key: 'c', label: 'Specific Heat (c)', symbol: 'c', unit: 'J/(g·°C)', defaultVal: 4.184, min: 0.1, max: 10, step: 0.05, presets: [{ label: 'Water (4.184)', value: 4.184 }, { label: 'Iron (0.45)', value: 0.45 }, { label: 'Copper (0.385)', value: 0.385 }] },
      { key: 'deltaT', label: 'Temp Change (ΔT)', symbol: 'ΔT', unit: '°C', defaultVal: 25, min: 1, max: 200, step: 1, presets: [{ label: '10 °C', value: 10 }, { label: '25 °C', value: 25 }, { label: '50 °C', value: 50 }] },
    ],
    calculate: (v) => {
      const q = v.m * v.c * v.deltaT;
      return {
        primaryValue: q.toFixed(1),
        primaryUnit: 'J',
        primarySymbol: 'q',
        substitutionSteps: [
          `q = m · c · ΔT`,
          `q = ${v.m} g × ${v.c} J/(g·°C) × ${v.deltaT} °C`,
          `q = ${q.toFixed(1)} Joules (${(q / 1000).toFixed(3)} kJ)`,
        ],
        metrics: [
          { label: 'Heat Absorbed (q)', symbol: 'q', value: q.toFixed(1), unit: 'J', color: 'emerald' },
          { label: 'Kilojoules (kJ)', symbol: 'kJ', value: (q / 1000).toFixed(3), unit: 'kJ', color: 'amber' },
        ],
      };
    },
  },
];
