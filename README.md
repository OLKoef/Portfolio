# Web Portfolio (Builder.io + Firebase + Vercel)

This project is a web portfolio with:
- **Content editing in Builder.io** (landing pages, sections, case studies, etc.)
- **User authentication via Firebase Authentication** (Google, Email/Password)
- **User file storage** (PDF, DOCX, code, etc.) in Firebase Storage + (optional) metadata in Firestore
- **Hosting and deployment via Vercel** (CI/CD directly from GitHub)

> Architecture: Builder.io manages static content and layout, Firebase handles login and file uploads, and Vercel provides hosting and automatic deployment.

---

## Prerequisites
- Node 18+
- (Recommended) Next.js 14+ or React 18
- A **Firebase project** with enabled Authentication (Email/Password and/or Google), Storage and (optional) Firestore
- A **Builder.io account** (free plan is sufficient to start)
- A **Vercel account** connected to GitHub/Repo

---

## Environment Variables
Create `.env.local` with the following keys:

```bash
# Builder
NEXT_PUBLIC_BUILDER_API_KEY=xxxxx
BUILDER_WEBHOOK_SECRET=secure-webhook-secret

# Firebase (used in client, loaded by Vercel from .env)
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxxx:web:xxxx
```
