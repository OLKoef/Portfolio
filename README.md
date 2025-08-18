# Student Document Hub: Feature Overview and Roadmap

This project is a hub for civil engineering students where they can log in, upload and organize files (PDF, Word, CAD, code, etc.).

## Introduction

This project serves as a document management hub specifically designed for civil engineering students. It provides a centralized platform for file storage, organization, and management with user authentication and automatic categorization features.

## Architecture

- **Content editing in Builder.io** (landing pages, sections, case studies, etc.)
- **User authentication via Firebase Authentication** (Email/PIN)
- **User file storage** (PDF, DOCX, CAD, code, etc.) in Firebase Storage with metadata in Firestore
- **Hosting and deployment via Vercel** (CI/CD directly from GitHub)

> Architecture: Builder.io manages static content and layout, Firebase handles login and file uploads, and Vercel provides hosting and automatic deployment.

## Core Features (Current)

- **User Authentication**: Firebase Authentication (Email/PIN)
- **File Upload**: Storage of all file types in Firebase Storage with metadata
- **Automatic Categorization**: File type, user ID, tags, timestamp stored in Firestore
- **File Management**: Listing, downloading, simple deletion
- **Content via Builder.io**: Landing pages, information pages

## Technical Principles

- **Metadata**: Custom metadata in Firebase Storage (e.g., file type, course code, tags)
- **File Listing**: Use `listAll()` to retrieve folders/paths and display content
- **Authentication**: Email/PIN based authentication

## Use Cases

- Students upload project reports in PDF, DWG, or DOCX formats
- System automatically tags files based on type and user (e.g., "CAD", "Notes")
- Organized file storage for course work and project documentation

## Future Enhancement Ideas

### File Organization and Search
- AI-based categorization
- Advanced search functionality
- Enhanced tagging system

### User Experience
- File preview functionality
- Version control
- Favorites system

### Collaboration
- File sharing and access control
- Comment system

### Integrations
- Calendar integration
- Export functionality
- Notifications system

### Technical Scaling
- Offline support
- Storage optimization
- Analytics and reporting

## Recommended Roadmap

### 1. MVP (Current + Small Improvements)
- Stable file upload with metadata
- Simple list view
- Login/logout with Firebase

### 2. Next Steps
- File preview (PDF/image)
- Tags and categories
- Improved search functionality

### 3. Long Term
- AI-driven categorization
- Sharing, groups, and comments
- Integration with calendar and course information
- Version control and history

## Conclusion

Student Document Hub is already a solid foundation. With focus on metadata management, file preview, and collaboration features, this can become a complete hub for all types of student projects and coursework.

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
