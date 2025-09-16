# CryptoView

A Next.js app for exploring crypto markets with charts, trending coins, and market stats.

## Requirements
- Node.js 18+ (or 20+ recommended)
- pnpm 9+
- A CoinGecko API key

## Getting Started

### 1) Clone and install
```bash
git clone https://github.com/codeakki/cryptoview.git
cd cryptoview
pnpm install
```

### 2) Configure environment
Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_COINGECKO_API_KEY=your_key_optional
```
Notes:
- If `NEXT_PUBLIC_COINGECKO_API_KEY` is omitted, requests may be rate-limited.
- `.env*` files are already ignored via `.gitignore`.

### 3) Run the app
```bash
pnpm dev
```
Then open `http://localhost:3000`.

## Scripts
- `pnpm dev` — start development server
- `pnpm build` — production build
- `pnpm start` — start production server (after build)
- `pnpm lint` — run Next.js lint

## Tech Stack
- Next.js 14
- React 18
- Tailwind CSS 4
- Radix UI / shadcn-style UI components
- CoinGecko API

## Project Structure
- `app/` — Next.js App Router pages/layouts
- `components/` — UI and feature components
- `lib/` — API clients and utilities
- `hooks/` — React hooks
- `styles/` — global styles

## Deployment
- Recommended: Vercel
- Ensure the same env vars are configured in your hosting provider.

## Troubleshooting
- If API requests fail or rate-limit, set `NEXT_PUBLIC_COINGECKO_API_KEY`.
- After changing env vars, restart the dev server.
- If `pnpm` is missing, install with `npm i -g pnpm`.