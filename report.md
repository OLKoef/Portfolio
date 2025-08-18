# Student Document Hub: Feature Overview and Roadmap

## Introduksjon

Dette prosjektet er en hub for byggingeniørstudenter som kan logge inn, laste opp og
organisere filer (PDF, Word, CAD, kode m.m.).

## Core Features (nåværende)

- Brukerautentisering: Firebase Authentication (Email/Pin)
- Filopplasting: Lagring av alle filtyper i Firebase Storage, med metadata
- Automatisk kategorisering: Filtype, bruker-ID, tags, timestamp lagres i Firestore
- Filhåndtering: Listing, nedlasting, enkel sletting
- Innhold via Builder.io: Landingssider, informasjonssider

## Tekniske prinsipper

- Metadata: Custom metadata i Firebase Storage (f.eks. filtype, kurskode, tagger)
- List all files: Bruk `listAll()` for å hente mapper/paths og vise innhold
- Autentisering: Email/pin

## Bruksscenarioer

- Studenter laster opp prosjektrapporter i PDF, DWG eller DOCX
- Systemet tagger automatisk filene basert på type og bruker (eks. “CAD”, “Notater”)

## Utvidelsesidéer (framtidige funksjoner)

### Filorganisering og søk

- AI-basert kategorisering
- Avansert søk
- Tagging

### Brukeropplevelse

- Filforhåndsvisning
- Versjonskontroll
- Favoritter

### Samarbeid

- Deling og tilgangskontroll
- Kommentarer

### Integrasjoner

- Kalenderkobling
- Eksport
- Notifikasjoner

### Teknisk skalering

- Offline-støtte
- Storage optimering
- Analyser

## Anbefalt roadmap

1. MVP (nåværende + små forbedringer)

- Stabil filopplasting + metadata
- Enkel listevisning
- Login/logout med Firebase

1. Neste steg

- Filforhåndsvisning (PDF/image)
- Tags og kategorier
- Bedre søk

1. Lang sikt

- AI-drevet kategorisering
- Deling, grupper, kommentarer
- Integrasjon med kalender og kursinfo
- Versjonskontroll og historikk

## Konklusjon

Student Document Hub er allerede et godt utgangspunkt. Med fokus på metadata,
filforhåndsvisning og samarbeidsfunksjoner kan dette bli en komplett hub for alle typer
studentprosjekter og kursarbeid.
￼￼
