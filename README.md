# Web‑portfolio (Builder.io + Firebase + Vercel)

Dette prosjektet er en web‑portfolio med:
- **Innholdsredigering i Builder.io** (landingssider, seksjoner, case‑studier osv.)
- **Brukerautentisering via Firebase Authentication** (Google, Email/Password)
- **Lagring av brukerfiler** (PDF, DOCX, kode, m.m.) i Firebase Storage + (valgfritt) metadata i Firestore
- **Hosting og deploy via Vercel** (CI/CD direkte fra GitHub)

> Arkitektur: Builder.io styrer statisk innhold og layout, Firebase håndterer innlogging og filopplasting, og Vercel står for hosting og automatisk deploy.

---

## Forutsetninger
- Node 18+
- (Anbefalt) Next.js 14+ eller React 18
- En **Firebase‑prosjekt** med aktivert Authentication (Email/Password og/eller Google), Storage og (valgfritt) Firestore
- En **Builder.io‑konto** (gratis plan er nok for start)
- En **Vercel‑konto** koblet til GitHub/Repo

---

## Miljøvariabler
Opprett `.env.local` med følgende nøkler:

```bash
# Builder
NEXT_PUBLIC_BUILDER_API_KEY=xxxxx
BUILDER_WEBHOOK_SECRET=secure-webhook-secret

# Firebase (brukes i klienten, lastes inn av Vercel fra .env)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxx:web:xxxx
