# FreeAppStore Agent Guidelines & Compliance (GEMINI.md)

This repository follows the official **FreeAppStore (FAS)** application architecture, privacy guidelines, and design tokens.

---

## Commands
- `pnpm dev`: Starts the local Vite development server on port 3000.
- `pnpm build`: Runs `vite build` to generate the production bundle in `dist/`.
- `pnpm lint`: Runs `tsc --noEmit` to verify type safety across all components.

---

## Architectural Rules
1. **Zero External Trackers**: Never import telemetry SDKs or analytics scripts.
2. **Local Persistence**: Rely on `localStorage` for offline data storage.
3. **Typography & Styling**: Use `Manrope` for body and `Fraunces` for headings.
4. **Bundle Quota**: Keep the gzipped production bundle size below 300KB.
5. **Color System**: Rely exclusively on CSS platform tokens (`--paper`, `--ink`, `--accent`, `--line`, etc.).
