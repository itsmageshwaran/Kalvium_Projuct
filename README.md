# Campus Event Hub 🎓

> **"AI makes event creation effortless. Human verification makes event discovery trustworthy."**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Multimodal%20Vision-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Kalvium%20Design%20System-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**Campus Event Hub** is an authentic, production-grade EdTech platform designed with **Kalvium's** bold, editorial visual language. It replaces chaotic WhatsApp blasts, Instagram screenshots, and fragmented Google Forms with an authenticated, AI-driven verified event pipeline with real-time schedule clash protection.

---

## 📑 Table of Contents

- [The Core Pipeline](#-the-core-pipeline)
- [Three Distinct User Roles](#-three-distinct-user-roles)
- [Key Innovations & Technical Capabilities](#-key-innovations--technical-capabilities)
  - [1. Multimodal AI Vision & Anti-Hallucination Engine](#1-multimodal-ai-vision--anti-hallucination-engine)
  - [2. Pre-Submission Duplicate & Venue Collision Detector](#2-pre-submission-duplicate--venue-collision-detector)
  - [3. Campus Manager Verification Studio](#3-campus-manager-verification-studio)
  - [4. Mathematical Schedule Clash Engine](#4-mathematical-schedule-clash-engine)
- [System Architecture](#-system-architecture)
- [Directory Structure](#-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone & Install Dependencies](#1-clone--install-dependencies)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Seed Demo Users & Roles](#3-seed-demo-users--roles)
  - [4. Run the Development Server](#4-run-the-development-server)
- [Demo Accounts](#-demo-accounts)
- [API Reference](#-api-reference)
- [Security & Data Integrity](#-security--data-integrity)
- [Verification & Automated Test Suites](#-verification--automated-test-suites)

---

## 🌟 The Core Pipeline

```mermaid
flowchart TD
    A[Organizer or Student Uploads Poster] --> B[AI Multimodal Vision Extraction]
    B --> C{Confidence Badges & Anti-Hallucination}
    C --> D[Pre-Submission Duplicate & Venue Collision Check]
    D --> E[Submit as PENDING Draft]
    E --> F[Campus Manager Verification Studio]
    F --> G{Manager Scrutiny}
    G -- "Approve (w/ Optional In-Place Edits)" --> H["✓ CAMPUS VERIFIED Seal & Confetti"]
    G -- "Decline (w/ Preset Reason & Custom Notes)" --> I[Status: DECLINED & Feedback to Submitter]
    H --> J[Public Student Event Feed & Search]
    J --> K[Student Clicks 'Save to Schedule']
    K --> L{Clash Engine: startA < endB && startB < endA}
    L -- Overlap Detected --> M[Interactive Clash Modal with Overlap Details & Override]
    L -- No Conflict --> N[Saved to Personal Agenda & Timeline]
```

---

## 👥 Three Distinct User Roles

| Role | Access Level | Primary Dashboard & Capabilities |
| :--- | :--- | :--- |
| **🎓 Student** | Public & Authenticated | • Browse **only** Manager-approved events with the `✓ CAMPUS VERIFIED` stamp.<br>• Real-time search across titles, organizers, venues, categories, tags, and keywords.<br>• Filter by **Today**, **Tomorrow**, **This Week**, **Upcoming**, and **Past**.<br>• Save events to personal agenda with instant **Schedule Clash Warnings**.<br>• Propose campus events/workshops directly to the Campus Manager for verification. |
| **🏛 Event Organizer** | Verified Organizers | • **AI Poster Analyzer Studio**: Drag-and-drop promotional posters or test with 1-click sample posters.<br>• Progress radar tracking OCR extraction, date normalization, and anti-hallucination analysis.<br>• Review extracted fields with **HIGH**, **MEDIUM**, and **LOW** confidence badges.<br>• Pre-submission duplicate detector preventing redundant submissions.<br>• Track submission statuses (`PENDING`, `APPROVED`, `DECLINED`) and read manager feedback notes.<br>• *Strict Rule: Organizers cannot publish directly to students without Manager verification.* |
| **🛡 Campus Manager** *(Signature)* | Campus Administration | • Dedicated **Verification Queue** with live status counters.<br>• **Side-by-Side Studio**: Original promotional poster artwork alongside AI-extracted structured fields.<br>• Field-level scrutiny highlighting uncertain values (e.g. low-contrast logos, unstated end times).<br>• In-place inline corrections before approving.<br>• **Approve**: Stamps event with **`✓ CAMPUS VERIFIED`**, records manager name and timestamp, and publishes to the student feed.<br>• **Decline**: Modal with preset reasons (*Information doesn't match poster*, *Unauthorized organizer*, etc.) + custom notes.<br>• Complete **Audit History** tracking every managerial action. |

---

## 🔬 Key Innovations & Technical Capabilities

### 1. Multimodal AI Vision & Anti-Hallucination Engine
* **Integration**: Powered by `@google/generative-ai` with Google Gemini Flash Vision models (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.7-flash`, etc.).
* **Anti-Hallucination Guardrails**:
  * The prompt strictly forbids inventing speakers, sponsors, prize money, fee amounts, venues, or dates.
  * Ambiguous or unstated fields return `"Not specified"` or `"Needs verification"` rather than fabricated assumptions.
  * Every field is tagged with an optical confidence tier:
    * `HIGH`: Crisp, prominent typography.
    * `MEDIUM`: Smaller subtext or contextually inferred values.
    * `LOW`: Ambiguous, partially obscured, or missing values requiring manager scrutiny.
* **Offline Resilience**: Includes 5 pre-calibrated sample posters ([ai-poster-constants.ts](file:///c:/Users/udeep/OneDrive/Desktop/kalvium/projectFiles/kalviumProject/Kalvium_Projuct/src/lib/ai-poster-constants.ts)) for 1-click offline testing and demoing without requiring active API credits.

### 2. Pre-Submission Duplicate & Venue Collision Detector
Before an organizer or student submits an event, the system runs:
* **Title & Text Similarity**: Word-level Dice similarity coefficient ($\ge 0.75$) against existing `APPROVED` and `PENDING` events on that date.
* **Venue Scheduling Collision**: Flags if another event is already booked at the exact same physical venue during the requested time window.

### 3. Campus Manager Verification Studio
The central quality gate preventing fake, duplicate, or inaccurate event announcements:
* **Split-View Canvas**: Displays the high-resolution source poster alongside structured fields.
* **Inline Edits**: Correct erroneous dates, times, venues, or descriptions directly in the studio prior to approval.
* **State Machine Guard**: Only events in `PENDING` status can be verified or declined.
* **Permanent Audit Log**: Every managerial decision is recorded in an `approvalHistory` subcollection detailing who verified the event, timestamps, and feedback notes.

### 4. Mathematical Schedule Clash Engine
Located in [src/lib/clash.ts](file:///c:/Users/udeep/OneDrive/Desktop/kalvium/projectFiles/kalviumProject/Kalvium_Projuct/src/lib/clash.ts):
* **Strict Non-Blocking Overlap**: Two events clash on the same calendar date if and only if:
  $$\text{start}_A < \text{end}_B \quad\land\quad \text{start}_B < \text{end}_A$$
* **Back-to-Back Friendly**: Consecutive events (e.g., `10:00 AM - 12:00 PM` and `12:00 PM - 01:00 PM`) **do not clash**.
* **Overnight Spans**: Correctly calculates multi-hour events wrapping past midnight (e.g., `10:00 PM` to `02:00 AM`).
* **Non-Blocking User Experience**: Students are shown a comprehensive modal detailing the conflicting event name and exact overlap duration (e.g. `10:30 AM – 11:30 AM (60 mins)`), while retaining a "Save Anyway" option.

---

## 🛠 System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 14 Frontend Layer                       │
│  Tailwind CSS (Kalvium Theme) · Framer Motion · GSAP · Lenis · Lucide  │
├────────────────────────────────┬───────────────────────────────────────┤
│       Student Experience       │     Organizer & Manager Studios       │
│  • Public Feed & Timeline      │  • AI Poster Analyzer Studio          │
│  • Personal Agenda & Schedule  │  • Side-by-Side Verification Canvas   │
│  • Real-Time Clash Warnings    │  • Audit History & Submissions Queue  │
└────────────────────────────────┴───────────────────────────────────────┘
                                   │
                   Session Cookies / Bearer ID Tokens
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    Next.js API Routes & Middleware                     │
│  • /api/auth/*     • /api/events/*      • /api/ai/analyze-poster       │
│  • /api/manager/*  • /api/organizer/*   • /api/saved/*                 │
├────────────────────────────────────────────────────────────────────────┤
│                 Role-Based Authorization & Custom Claims               │
│               STUDENT   ·   ORGANIZER   ·   CAMPUS_MANAGER             │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
┌──────────────────▼───────────────┐ ┌─────────────▼─────────────────────┐
│   Google Gemini Flash Vision     │ │      Firebase Cloud Services      │
│  • Multimodal Vision Extraction  │ │  • Firebase Authentication        │
│  • Confidence Scoring & Guard    │ │  • Cloud Firestore (NoSQL DB)     │
│  • Anti-Hallucination Schema     │ │  • Firebase Cloud Storage         │
└──────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 📁 Directory Structure

```text
kalviumProject/Kalvium_Projuct/
├── firestore.rules              # Granular Firestore security & RBAC rules
├── storage.rules                # Firebase Storage access rules for posters
├── package.json                 # Project dependencies & automated scripts
├── tailwind.config.ts           # Kalvium editorial design tokens & color palette
├── scripts/
│   ├── seed-roles.mjs           # Seeds default Manager, Organizer, and Student accounts
│   ├── set-role.mjs             # CLI tool to assign roles to any user account
│   ├── e2e-firebase.mjs         # 8-stage comprehensive end-to-end integration test
│   ├── verify-clash.mjs         # Exact collision & interval clash test matrix
│   └── verify-student-event-flow.mjs # Full lifecycle test for student event proposals
├── src/
│   ├── middleware.ts            # Route protection & role-based dashboard redirects
│   ├── app/
│   │   ├── api/                 # Next.js Route Handlers (Auth, Events, AI, Manager, Saved)
│   │   ├── dashboard/           # Role-segmented dashboards:
│   │   │   ├── student/         # Agenda, conflict tracker, event request tabs
│   │   │   ├── organizer/       # Event submissions & status monitoring
│   │   │   └── manager/         # Signature Verification Studio & Audit History
│   │   ├── events/              # Public verified discovery feed & event detail pages
│   │   ├── schedule/            # Chronological student schedule & countdowns
│   │   ├── login/ & register/   # Domain-gated campus authentication pages
│   │   └── page.tsx             # Editorial landing page with live feed & interactive demo
│   ├── components/              # Reusable UI primitives, modals & verification studio
│   ├── context/
│   │   ├── AuthContext.tsx      # Firebase Auth state, session token exchange, cookie management
│   │   └── ThemeContext.tsx     # Light & Dark theme state
│   └── lib/
│       ├── firebase/            # Firebase Client & Firebase Admin SDK initialization
│       ├── auth.ts              # Server-side auth, session cookie verification, RBAC guards
│       ├── clash.ts             # Mathematical collision & interval overlap engine
│       ├── time.ts              # Time greetings, relative countdowns, starting soon filters
│       └── ai-poster-analyzer.ts# Multimodal Gemini vision pipeline & duplicate detector
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or newer (v20+ recommended)
- **npm**: v9 or newer
- A **Firebase Project** (with Authentication, Firestore, and Storage enabled)
- *(Optional)* A **Google Gemini API Key** for real-time poster extraction (fallback sample presets work offline)

---

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/<your-username>/campus-event-hub.git
cd campus-event-hub
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Google Gemini API Key (Optional: for online multimodal poster extraction)
GEMINI_API_KEY="your-gemini-api-key"

# Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> [!TIP]
> Make sure your `FIREBASE_PRIVATE_KEY` keeps its newline characters intact (`\n`). The system automatically handles both raw and escaped newlines.

---

### 3. Seed Demo Users & Roles

Seed the predefined campus accounts with custom claims:

```bash
npm run seed
```

To assign or change the role of any account at any time:
```bash
node scripts/set-role.mjs <email> <STUDENT|ORGANIZER|CAMPUS_MANAGER>
```

---

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

Use these accounts to test the entire lifecycle:

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **🛡 Campus Manager** | `manager@kalvium.com` | `Manager@12345` | Verification Studio, Approval History, Full Moderation |
| **🏛 Event Organizer** | `organizer@kalvium.community` | `Organizer@12345` | AI Poster Studio, Submissions Dashboard, Duplicate Alerts |
| **🎓 Student** | `student@kalvium.community` | `Student@12345` | Verified Events Feed, Personal Agenda, Clash Alerts, Proposals |

> [!NOTE]
> Public self-registration on the `/register` page is restricted to `@kalvium.community` and `@kalvium.com` emails. Registration defaults to the `STUDENT` role (`CAMPUS_MANAGER` cannot be self-registered).

---

## 📡 API Reference

### Public & Student Endpoints
* **`GET /api/events`**: Fetch verified (`APPROVED`) events with keyword search, category, and date filtering (`ALL`, `TODAY`, `TOMORROW`, `THIS_WEEK`, `PAST`).
* **`GET /api/events/[id]`**: Fetch public details of an approved event. (Pending events return 403 unless requested by the author or a manager).
* **`GET /api/saved`**: Fetch authenticated student's saved events, schedule groups, and detected pairwise clashes.
* **`POST /api/saved/toggle`**: Add or remove an event from the user's personal schedule.
* **`POST /api/saved/check-clash`**: Evaluate if saving an event introduces a schedule collision with existing saved events.

### AI & Event Submission Endpoints
* **`POST /api/ai/analyze-poster`**: Extract structured metadata from an uploaded poster image via Gemini Vision, returning optical confidence ratings and duplicate checks.
* **`POST /api/organizer/submit`**: Submit a new event draft (initial status is always set to `PENDING`). Automatically stores the poster image in Firebase Storage.
* **`POST /api/organizer/check-conflicts`**: Check for venue scheduling conflicts and title duplicates before submitting.
* **`GET /api/organizer/events`**: Fetch user's event submissions with real-time status and feedback notes.
* **`DELETE /api/organizer/events/[id]`**: Delete a submission (permitted for the owner or a Campus Manager).

### Manager Verification Endpoints
* **`GET /api/manager/pending`**: Fetch the queue of pending event submissions along with extraction confidence subcollections.
* **`POST /api/manager/verify`**: Approve or decline an event. Applies manager corrections, logs the audit record, and updates status.
* **`GET /api/manager/history`**: Retrieve the complete managerial audit trail.

---

## 🔒 Security & Data Integrity

1. **Authentication & Session Tokens**:
   * Uses Firebase Authentication with secure, HTTP-only session cookies (`campus_auth_token`, SameSite=Lax).
   * Custom claims (`role`) are stored securely on the Firebase Auth user object, preventing client-side spoofing.
2. **Database Security Rules ([firestore.rules](file:///c:/Users/udeep/OneDrive/Desktop/kalvium/projectFiles/kalviumProject/Kalvium_Projuct/firestore.rules))**:
   * Students and Organizers cannot modify event statuses directly.
   * Only authenticated users with `CAMPUS_MANAGER` custom claims can modify status to `APPROVED` or `DECLINED`.
   * Subcollections `analyses` and `approvalHistory` can only be written by the server via the Firebase Admin SDK.
3. **Storage Security Rules ([storage.rules](file:///c:/Users/udeep/OneDrive/Desktop/kalvium/projectFiles/kalviumProject/Kalvium_Projuct/storage.rules))**:
   * Image uploads are restricted to image MIME types and capped at 10MB.
4. **URL & Input Sanitization**:
   * `sanitizeUrl` validates all incoming URLs, rejecting dangerous protocols (`javascript:`, `data:text/html`, etc.).

---

## 🧪 Verification & Automated Test Suites

The codebase includes an extensive testing and verification suite covering unit logic, math invariants, and end-to-end user flows.

### 1. Mathematical Clash Matrix Test
Validates interval collision math, back-to-back non-clashes, boundary conditions, and overnight time wraps:
```bash
npm run verify-clash
```

### 2. Comprehensive 8-Stage E2E Firebase Test
Simulates the full user journey: Auth claim verification $\to$ Multimodal AI extraction $\to$ Organizer draft submission $\to$ Access barrier verification $\to$ Manager verification studio approval $\to$ Public feed indexing $\to$ Agenda clash detection $\to$ Cleanup:
```bash
npm run test:e2e
```

### 3. Student Event Proposal Lifecycle
Validates student event requests, manager verification, and publication:
```bash
node scripts/verify-student-event-flow.mjs
```

### 4. AI Poster Multimodal Extraction
Tests the vision extraction and OCR confidence parser against sample and real images:
```bash
node scripts/test-poster-analysis.mjs
```

---

## 📄 Production Build

To test the production build locally:

```bash
npm run build
npm start
```

---

## 🏆 Project Philosophy

> "Campus life moves fast, and students miss great opportunities due to fractured information. By combining **multimodal AI** to remove the friction of event creation with **human manager curation** to guarantee authenticity, Campus Event Hub creates a single, reliable source of truth for the entire university community."
