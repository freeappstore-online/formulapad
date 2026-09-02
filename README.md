# FormulaPad

> Interactive Visual STEM Formula, Physics Simulation & Scientific Calculation Studio built for **[FreeAppStore](https://freeappstore.online)**.

[![FreeAppStore Compliant](https://img.shields.io/badge/FreeAppStore-Compliant-10b981.svg)](https://freeappstore.online)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-%3C170%20KB%20gzip-emerald)](dist/)

---

## ✨ Features

- **40 Interactive STEM Formulas**: Across Physics (Mechanics, Thermodynamics, Electromagnetism, Waves), Mathematics (Geometry, Trigonometry, Calculus, Combinatorics), Chemistry (Gas Laws, Solutions, Thermodynamics), and Engineering (Fluids, Electricity, Signal Processing).
- **Physics-Accurate Continuous Simulations**: Real-time 60 FPS harmonic oscillation engine with dynamic SVG visualizer, ghost swing arcs, and planetary presets (Earth, Moon, Mars, Jupiter).
- **Step-by-Step Derivations**: Complete algebraic substitution steps and mathematical breakdowns for every formula.
- **Custom Expression Sandbox**: Dynamic mathematical expression evaluator with variable parameter bindings and instant graphing.
- **2D Pan & Zoom Workspace**: Seamless omnidirectional navigation with dynamic transform-origin anchoring to prevent edge-clipping.
- **Privacy & Offline First**: Zero tracking, zero telemetry, zero cookies; 100% on-device local storage and PWA-ready.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript 5.8
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS 4 (`Manrope` + `Fraunces`)
- **Platform SDK**: `@freeappstore/sdk`
- **Icons**: `lucide-react`
- **Package Manager**: `pnpm` 10

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/your-username/formulapad.git
cd formulapad

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Production Build & Verification
```bash
# Compile and bundle
pnpm run build

# Run type check and linting
pnpm run lint
```

---

## 📜 Compliance & Rules

- **Zero Trackers**: No third-party analytics or external network requests.
- **Strictly Local Storage**: All user settings, favorites, and history persist in `localStorage`.
- **Bundle Quota**: Less than 300KB gzipped (current build: ~167KB gzipped).
- **Design System**: Strict adherence to FreeAppStore tokens (`--paper`, `--ink`, `--accent`, `--line`, etc.).

---

## 📄 License

MIT © [FreeAppStore Community](LICENSE)
