# BKeepr Frontend

Next.js 15 · Auth und Workspace-Verwaltung aus dem Boilerplate, BKeepr-Branding und Geräte-Platzhalter.

## Entwicklung

```bash
cp .env.example .env.local
npm install
npm run dev
```

Siehe [`docs/webapp-setup.md`](../docs/webapp-setup.md) für Backend und Datenbank.

## Struktur

| Pfad | Inhalt |
|---|---|
| `app/config/branding.ts` | App-Name, Tagline, Domain-Platzhalter |
| `app/(user)/workspace/[id]/devices/` | Geräte-UI (Platzhalter bis AP-8) |
| `components/layout/BKeeprLogo.tsx` | Logo in Sidebars |

API-Basis-URL: `NEXT_PUBLIC_API_URL` (Default `http://localhost:8080/api`).
