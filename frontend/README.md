# PRISM Frontend

React + TypeScript + Tailwind CSS desktop frontend for PRISM (Proactive Regulatory Intelligence & Status Monitoring).

## Setup & Running

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Typecheck and produce production bundle in `dist/`
- `npm run typecheck`: Run TypeScript compiler check without emitting files
- `npm run lint`: Run ESLint checks
- `npm run test`: Run automated Vitest test suite (including WCAG contrast verification)

## Design System

- **Tokens**: 6 semantic themes (`daylight`, `dusk`, `void`, `paper`, `contrast-light`, `contrast-dark`) defined in `src/styles/tokens.css`.
- **Typography**: Inter (UI text) + JetBrains Mono (numerals, codes, dates) with `tabular-nums`.
- **Target Viewport**: Desktop 1280px and wider (optimal at 1440px).
