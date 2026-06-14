# 🎫 Link Desk — URL Shortener

A full-stack URL shortener with a custom "claim ticket" design — paste a long URL, get back a short one styled like a perforated ticket stub.

**🔗 Live demo:** [url-shortener-xi-roan-55.vercel.app](https://url-shortener-xi-roan-55.vercel.app)

![Link Desk screenshot](./screenshot.png)

## ✨ Features

- Shorten any valid URL into a compact, shareable link
- Custom design system — dark "ticket counter" theme with perforated edges and a vermillion accent
- Redis-cached redirects (301) for fast lookups, with PostgreSQL as the source of truth
- Click tracking on every short link
- Optional expiry dates and custom slugs (API-level support)
- One-click copy to clipboard

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 (driver adapters) |
| Database | PostgreSQL (Neon in production, Docker locally) |
| Cache | Redis / ioredis (Upstash in production, Docker locally) |
| Deployment | Vercel |

## 🏗 How It Works

1. `POST /api/shorten` — validates the URL, generates a short slug (via `nanoid`), stores it in Postgres, and caches it in Redis for 24h.
2. `GET /:slug` — checks Redis first (fast path); on a cache miss, falls back to Postgres, re-caches, and increments the click counter. Returns a `301` redirect to the original URL.

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Docker Desktop

### Setup

\`\`\`bash
git clone https://github.com/Simrozechawla/url-shortener.git
cd url-shortener
npm install
\`\`\`

Create \`.env\` and \`.env.local\` in the project root:

\`\`\`env
# .env (used by Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urlshortener?schema=public"

# .env.local (used by Next.js)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urlshortener?schema=public"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
\`\`\`

Start Postgres + Redis, run migrations, and start the dev server:

\`\`\`bash
docker compose up -d
npx prisma migrate dev
npx prisma generate
npm run dev
\`\`\`

Visit \`http://localhost:3000\`.

## 📡 API Reference

### Create a short link
\`\`\`
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/some/very/long/path",
  "customSlug": "optional-custom-slug"
}
\`\`\`

**Response**
\`\`\`json
{
  "shortUrl": "https://your-domain.com/aB3xY9",
  "slug": "aB3xY9",
  "originalUrl": "https://example.com/some/very/long/path",
  "createdAt": "2026-06-12T11:56:17.768Z"
}
\`\`\`

### Redirect
\`\`\`
GET /:slug → 301 redirect to original URL
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── app/
│   ├── api/shorten/route.ts   # POST endpoint to create short links
│   ├── [slug]/route.ts        # GET endpoint, redirects + click tracking
│   ├── page.tsx                # Frontend UI
│   └── globals.css             # Theme, perforation effects, animations
├── lib/
│   ├── prisma.ts                # Prisma client (singleton, driver adapter)
│   └── redis.ts                 # Redis client
prisma/
└── schema.prisma                # Link model: slug, originalUrl, clicks, expiresAt
\`\`\`

## 🗺 Roadmap

- [ ] Custom slug input on the frontend
- [ ] Click analytics dashboard
- [ ] QR code generation per link
- [ ] Link expiry UI

## 👤 Author

**Simroze Chawla**
[GitHub](https://github.com/Simrozechawla) · [LinkedIn](https://linkedin.com/in/simroze-chawla-78ab47271)