# 🎓 Campus Event Hub

> **"AI makes event creation easier. Human verification makes event discovery trustworthy."**

A production-quality **EdTech platform** built for [Kalvium](https://kalvium.community/), replacing scattered WhatsApp/Instagram event announcements with an authenticated, AI-driven, manager-verified event pipeline — complete with real-time schedule clash protection.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🤖 AI Poster Analyzer | Upload event posters — Gemini Vision extracts all fields automatically |
| ✅ Manager Verification Studio | Side-by-side poster vs. AI output review before publishing |
| 🛡️ Role-Based Access | Student, Organizer, and Campus Manager with JWT-secured routes |
| ⚡ Real-Time Clash Detection | Mathematical interval overlap engine prevents schedule conflicts |
| 🎨 Kalvium Design Language | Authentic editorial aesthetic — coral accents, cream paper, Space Grotesk |
| 🚀 1-Click Demo Mode | Instant role switching for evaluation with real JWT auth |

---

## 🔄 The Core Pipeline

```
UPLOAD EVENT POSTER
       ↓
AI MULTIMODAL EXTRACTION
(Optical Vision + Field-Level Confidence + Anti-Hallucination)
       ↓
ORGANIZER REVIEW & EDIT
(Private Draft → Pending Verification)
       ↓
CAMPUS MANAGER VERIFICATION STUDIO
(Side-by-Side: Original Poster ↔ AI-Extracted Fields)
       ↓
✓ CAMPUS VERIFIED STAMP
(Approve with Corrections  OR  Decline with Custom Feedback)
       ↓
PUBLIC STUDENT DISCOVERY
(Search, Category Filters, Timeline Sorting)
       ↓
SAVE TO PERSONAL AGENDA
       ↓
REAL-TIME CLASH DETECTION ENGINE
(startA < endB && startB < endA)
       ↓
SMART SCHEDULE & REMINDERS
(🔥 STARTING SOON [<24h] • TODAY • TOMORROW • UPCOMING)
```

---

## 👥 Roles & Capabilities

### 🎓 Student
- Browse **only** manager-approved events stamped with `✓ CAMPUS VERIFIED`.
- Real-time search across titles, organizers, venues, and keywords.
- Multi-dimensional filters: *Today*, *Tomorrow*, *This Week*, *Upcoming*, *Category*.
- Save events with instant **Schedule Clash Warnings** before conflicts happen.
- Personal dashboard with greeting, starting-soon spotlight, and schedule conflict tracker.
- **My Schedule** view grouped by 🔥 Starting Soon, Today, Tomorrow, Upcoming.

### 🏛️ Event Organizer
- **AI Poster Analyzer Studio** — drag-and-drop JPG/PNG/WebP posters or use 1-click sample posters.
- Multi-stage progress indicator simulating OCR, date normalization, and anti-hallucination steps.
- Review AI-extracted fields with **High / Medium / Low** confidence badges per field.
- Built-in **Duplicate Detector** — alerts if an event with the same title/date/venue already exists.
- Organizer Dashboard with totals for Submissions, Pending, Approved, and Declined with manager notes.
- *Strict Rule: Organizers cannot directly publish events to students.*

### 🛡️ Campus Manager *(Signature Feature)*
- Dedicated **Verification Center** showing all pending submissions.
- **Side-by-Side Studio**: Original poster image alongside AI-extracted structured fields.
- In-place editing — correct dates, times, venues, or descriptions before approval.
- **Approve** → stamps `✓ CAMPUS VERIFIED`, fires confetti, records manager name + timestamp, publishes to feed.
- **Decline** → modal with preset reasons + custom free-text notes sent back to the organizer.
- Complete **Audit History** logging every managerial decision.

---

## ⚡ 1-Click Demo Evaluation Mode

A persistent **DEMO EVALUATION BAR** is pinned to the top of the header. Clicking any account performs real JWT authentication against the database:

| Role | Name | Email | Password |
|---|---|---|---|
| 🎓 **Student** | Alex Johnson | `alex@campus.edu` | `demo12345` |
| 🏛️ **Organizer** | Robotics & AI Society | `robotics@campus.edu` | `demo12345` |
| 🛡️ **Campus Manager** | Dr. Alistair Sharma | `manager@campus.edu` | `demo12345` |

> To hide the demo bar in production, set `NEXT_PUBLIC_DEMO_MODE="false"` in `.env`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14.2 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript 5.6 |
| **Database** | SQLite via Prisma ORM |
| **Styling** | Tailwind CSS (Kalvium design tokens) |
| **AI Integration** | Google Gemini 1.5/2.0 Flash Vision API |
| **AI Fallback** | Built-in local OCR/heuristics engine (works offline) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs password hashing |
| **Animations** | Framer Motion, Lenis smooth scroll, Canvas Confetti |
| **Icons** | Lucide React |

### 🎨 Kalvium Design Tokens

| Token | Value | Usage |
|---|---|---|
| Background | `#FAF6F0` | Warm cream canvas |
| Cards | `#FFFFFF` | Crisp paper-white |
| Accent | `#E8492D` | Kalvium coral red |
| Verified | `#2F855A` | Forest green stamp |
| Clash Warning | `#B7791F` | Warm amber alert |
| Border | `#E7E2D8` | Hairline separator |
| Display Font | Space Grotesk | Headlines & badges |
| Body Font | Inter | Body copy & UI text |

---

## 🗂️ Project Structure

```
Kalvium_Project/
├── prisma/
│   └── schema.prisma          # SQLite schema (User, Event, SavedEvent, EventAnalysis, ApprovalHistory)
├── scripts/
│   ├── seed.mjs               # Database seed with demo accounts & sample events
│   └── verify-clash.mjs       # Standalone clash-detection math verifier
├── src/
│   ├── app/
│   │   ├── api/               # Route handlers (auth, events, schedule, manager)
│   │   ├── dashboard/         # Student, Organizer, Manager dashboards
│   │   ├── events/            # Event listing & detail pages
│   │   ├── schedule/          # Personal schedule view
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── layout.tsx         # Root layout with Navbar & DemoSwitcherBar
│   │   └── page.tsx           # Landing / home page
│   ├── components/
│   │   ├── CreateEventStudio.tsx      # AI Poster Analyzer Studio
│   │   ├── EventCard.tsx              # Event listing card
│   │   ├── EventDetailDrawer.tsx      # Event detail side panel
│   │   ├── ClashWarningModal.tsx      # Schedule conflict modal
│   │   ├── DeclineReasonModal.tsx     # Manager decline modal
│   │   ├── DemoSwitcherBar.tsx        # 1-click demo role switcher
│   │   ├── CampusVerifiedBadge.tsx    # ✓ CAMPUS VERIFIED stamp
│   │   ├── Navbar.tsx                 # Global navigation bar
│   │   ├── MagneticButton.tsx         # Magnetic hover button
│   │   ├── TiltCard.tsx               # 3D tilt card effect
│   │   └── ...                        # Other UI utilities
│   ├── context/               # React context providers
│   └── lib/                   # Utility functions & Prisma client
├── .env.example               # Environment variable template
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Kalvium_Project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# SQLite database (no external server needed)
DATABASE_URL="file:./dev.db"

# JWT secret — change this in production!
JWT_SECRET="campus_event_hub_secure_key_2026_secret"

# Optional: Google Gemini API Key for AI poster analysis
# Leave empty to use the built-in offline OCR/parser fallback
GEMINI_API_KEY=""

# App base URL
NEXT_PUBLIC_APP_URL="http://localhost:3005"

# Demo switcher bar visibility
NEXT_PUBLIC_DEMO_MODE="true"
```

### 4. Initialize the Database & Seed Demo Data
```bash
npx prisma db push
node scripts/seed.mjs
```

This creates the SQLite database and seeds:
- 3 demo user accounts (Student, Organizer, Campus Manager)
- Sample campus events across multiple categories

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🧪 Testing & Verification

### Run Clash Detection Math Verifier
```bash
npm run verify-clash
```

### Re-seed the Database
```bash
npm run seed
```

### Explore the Database Visually
```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3005 |
| `npm run build` | Build the production bundle |
| `npm start` | Start production server on port 3005 |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the database with demo data |
| `npm run verify-clash` | Verify clash detection math |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## 🔒 Security & Data Integrity

- **Server-Side Authorization** — All API routes verify JWT roles. Students cannot access pending events or manager endpoints; Organizers cannot self-approve.
- **Password Hashing** — All passwords are hashed with bcryptjs before storage.
- **Anti-Hallucination Enforced** — AI returns `"Not specified"` or `"Needs verification"` when fields are absent from the poster.
- **Zero Double-Bookings** — Students receive a prominent conflict modal detailing the overlapping event and the time window, with a non-blocking *"Save Anyway"* override.

---

## 🗄️ Database Schema

```
User
 ├── id, name, email, password, role (STUDENT | ORGANIZER | CAMPUS_MANAGER)
 ├── organizedEvents → Event[]
 ├── verifiedEvents  → Event[]
 └── savedEvents     → SavedEvent[]

Event
 ├── id, title, description, summary, date, startTime, endTime
 ├── venue, category, tags, posterUrl, registrationUrl, contactInfo
 ├── status (DRAFT | PENDING | APPROVED | DECLINED)
 ├── declineReason, declineCustomNotes
 ├── organizerId → User, verifiedById → User, verifiedAt
 ├── savedBy     → SavedEvent[]
 ├── analyses    → EventAnalysis[]
 └── approvalHistory → ApprovalHistory[]

SavedEvent    → userId + eventId (unique pair)
EventAnalysis → rawExtractedData + confidenceData (JSON)
ApprovalHistory → eventId + managerId + action + reason + notes
```

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## 📄 License

This project was created as part of the **Kalvium** evaluation challenge.

---

<div align="center">
  <strong>Built with ❤️ for Kalvium</strong><br/>
  Next.js · TypeScript · Prisma · Gemini AI · Tailwind CSS
</div>
