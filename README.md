# Campus Event Hub 🎓

> **"AI makes event creation easier. Human verification makes event discovery trustworthy."**

An innovative, production-quality EdTech platform inspired by **Kalvium's** bold, editorial visual design language. Campus Event Hub transforms campus life by replacing tedious manual forms and scattered WhatsApp/Instagram announcements with an authenticated, AI-driven verified event pipeline with real-time schedule clash protection.

---

## 🌟 The Core Pipeline

```text
UPLOAD EVENT POSTER
       ↓
AI MULTIMODAL EXTRACTION
(Optical Vision + Field-Level Confidence + Anti-Hallucination)
       ↓
ORGANIZER REVIEW & EDIT
(Private Draft / Pending Verification)
       ↓
CAMPUS MANAGER VERIFICATION STUDIO
(Side-by-Side Comparison: Poster Truth vs. AI Extraction)
       ↓
✓ CAMPUS VERIFIED STAMP
(Approve with Corrections OR Decline with Custom Feedback)
       ↓
PUBLIC STUDENT DISCOVERY
(Search, Categorical Filters, Soonest / Timeline Sorting)
       ↓
SAVE TO PERSONAL AGENDA
       ↓
REAL-TIME CLASH DETECTION ENGINE
(Strict Non-Blocking Overlap Warning: startA < endB && startB < endA)
       ↓
SMART SCHEDULE & REMINDERS
(🔥 STARTING SOON [<24h] • TODAY • TOMORROW • UPCOMING)
```

---

## 👥 Three Distinct Roles & Capabilities

### 1. 🎓 Student
- Browse **only** Manager-approved events with the glowing **`✓ CAMPUS VERIFIED`** stamp.
- Real-time search across event titles, organizers, venues, and keywords.
- Multi-dimensional filters: *Today*, *Tomorrow*, *This Week*, *Upcoming*, and *Category*.
- Save events to personal calendar with instant **Schedule Clash Warnings**.
- Personal Student Dashboard with greeting, starting soon spotlight, and schedule conflicts tracker.
- **My Schedule** view grouped by **🔥 STARTING SOON** (<24h), **Today**, **Tomorrow**, and **Upcoming**.

### 2. 🏛 Event Organizer
- **AI Poster Analyzer Studio**: Drag and drop promotional poster images (JPG, PNG, WebP) or test with 1-click sample campus posters.
- Multi-stage progress radar simulating optical layout parsing, date/time normalization, and anti-hallucination verification.
- Review AI-extracted structured fields with **High**, **Medium**, and **Low** confidence badges.
- Built-in **Duplicate Event Detector** alerting if an event with matching title/date/venue already exists.
- Organizer Dashboard tracking Total Submissions, Pending, Approved, and Declined items with manager feedback notes.
- *Strict Rule: Organizers cannot directly publish events to students.*

### 3. 🛡 Campus Manager (Signature Feature)
- Dedicated Verification Center displaying all pending submissions.
- **Side-by-Side Studio**: Large original poster artwork alongside AI-extracted structured fields.
- Field-level scrutiny highlighting uncertain values (e.g. low-contrast organizer logos or unstated end times).
- In-place editing: correct dates, times, venues, or descriptions directly before approving.
- **Approve**: Stamps event with **`✓ CAMPUS VERIFIED`**, triggers celebratory confetti, records manager name and timestamp, and publishes to student feed.
- **Decline**: Modal with preset reasons (*Information doesn't match poster*, *Event cannot be verified*, *Invalid venue/time*, *Duplicate*, *Unauthorized organizer*) plus custom notes.
- Complete **Audit History** logging every managerial decision.

---

## ⚡ 1-Click Demo Evaluation Mode

A persistent **DEMO EVALUATION BAR** is pinned to the header for instant presentation. Clicking any account seamlessly performs authentic JWT authentication with the database:

| Role | Name | Demo Email | Password |
|---|---|---|---|
| **Student** | Alex Johnson | `alex@campus.edu` | `demo12345` |
| **Organizer** | Robotics & AI Society | `robotics@campus.edu` | `demo12345` |
| **Campus Manager** | Dr. Alistair Sharma | `manager@campus.edu` | `demo12345` |

*(To hide the demo bar in production mode, set `NEXT_PUBLIC_DEMO_MODE="false"` in `.env`)*.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14.2 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5.6
- **Database**: SQLite via Prisma ORM (`prisma/schema.prisma`)
- **Styling**: Tailwind CSS (Authentic Kalvium visual language: warm cream `#FAF6F0` background, crisp paper-white cards, signature Kalvium coral `#E8492D` accents, verified forest green `#2F855A`, warm amber `#B7791F` clash warnings, hairline borders `#E7E2D8`, Space Grotesk display & Inter body typography).
- **AI Poster Analyzer**: Google Gemini 1.5/2.0 Flash Vision integration (`GEMINI_API_KEY`) paired with a calibrated local fallback OCR/heuristics engine for 100% offline reliability.
- **Clash Engine**: Exact interval collision math: `eventA.start < eventB.end && eventB.start < eventA.end`.
- **Icons & Micro-interactions**: Lucide React, Canvas Confetti.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Run Seed
```bash
npx prisma db push
node scripts/seed.mjs
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Verification & Automated Tests

Run the complete 20-point end-to-end test suite simulating the full Organizer → Manager → Student flow:

```bash
npx tsx scripts/e2e-test.mjs
```

Test the mathematical collision and back-to-back clash logic:
```bash
node scripts/verify-clash.mjs
```

---

## 🔒 Security & Data Integrity

- **Server-Side Authorization**: API routes check JWT roles. Students cannot access pending events or manager endpoints; Organizers cannot set status to `APPROVED`.
- **Anti-Hallucination Enforced**: AI returns *"Not specified"* or *"Needs verification"* when fields are missing from posters.
- **Zero Double-Bookings**: Students receive prominent modal alerts detailing conflicting events and overlap windows, with non-blocking *"Save Anyway"* override.
