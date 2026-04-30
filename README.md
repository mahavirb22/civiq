# Civiq — Your Civic Election Co-Pilot 🗳️

> A personalized, adaptive election education journey built for every Indian voter. Designed with enterprise-grade architecture for maximum code quality, security, and performance.

## 🔗 Live Demo & Repository
**GitHub Repository:** [Insert Public GitHub Repo URL]
**Live Application:** [Insert Cloud Run URL]

---

## 🎯 Vertical Chosen
**Election Process Education**

## 💡 Approach & Logic
Most election tools dump static information at users. Civiq does the opposite — it detects how the user feels (confused, skeptical, engaged) using Gemini AI and adapts its tone, depth, and language in real time.

Instead of a generic chatbot, Civiq is a **behavior-change journey engine**. It guides users through 5 concrete steps, tracking their progress persistently, and ensuring they actually show up to vote.

## 🧠 How The Solution Works
1. **Onboarding:** User enters their state and voting experience level.
2. **Check Registration:** Integrates official ECI portal links with contextual AI guidance.
3. **Find Polling Booth:** Uses Google Maps API to auto-detect and cache the nearest polling booth.
4. **Know Your Candidates:** Google Custom Search fetches real-time candidate data based on location.
5. **Understand Your Ballot:** An interactive, AI-guided walkthrough of the voting process.
6. **Set Reminder:** One-tap Google Calendar API integration.

---

## 🏆 Evaluation Focus Areas (How We Meet The Criteria)

### 1. Code Quality
- **Architecture:** Organized into a clean, domain-driven structure (`components`, `hooks`, `services`, `pages`).
- **Maintainability:** Extensive JSDoc `@typedef` annotations simulate TypeScript for robust intellisense.
- **Resilience:** Implemented strict React `ErrorBoundary` components to prevent app crashes and ensure graceful degradation.

### 2. Security
- **Hardened Server:** Express backend secured with `helmet` for Content Security Policy (CSP) enforcement.
- **Abuse Prevention:** Integrated `express-rate-limit` to prevent brute-force attacks and API quota exhaustion.
- **Data Privacy:** Anonymous Firestore sessions ensure zero Personally Identifiable Information (PII) is permanently retained.

### 3. Efficiency
- **API Caching:** Utilizes `node-cache` on the backend to cache Google Maps and Custom Search API responses, drastically reducing latency and API costs.
- **Payload Compression:** Express server leverages `compression` middleware (Brotli/Gzip) to minimize network transfer times.
- **Frontend Optimization:** Extensive use of `React.memo` and `useCallback` to prevent unnecessary component re-renders.

### 4. Testing
- **High Coverage:** Jest and React Testing Library provide comprehensive unit testing across core hooks (`useJourneyProgress`, `useChat`) and UI components (`ChatBubble`, `QuizModal`).
- **CI/CD:** Automated `.github/workflows/test.yml` ensures all tests and ESLint checks pass on every commit.

### 5. Accessibility
- **WCAG 2.1 AA Compliant:** Semantic HTML (`<main>`, `<nav>`, `<article>`) guarantees proper document structure.
- **Screen Reader Support:** Deep integration of `aria-live="polite"` for dynamic chat updates, comprehensive `aria-labels`, and Native TTS fallback.
- **Keyboard Navigation:** Strict focus trapping and `Escape` key management inside interactive modals.

### 6. Google Services
Our solution deeply integrates the Google Cloud ecosystem:
- **Gemini 1.5 Flash:** Powers the core adaptive chat engine and real-time quiz generation.
- **Google Maps JS API:** Provides geolocation and nearest polling booth detection.
- **Google Calendar API:** Enables seamless election day reminders.
- **Google Text-to-Speech:** Accessible read-aloud functionality for every AI message.
- **Google Custom Search:** Fetches real-time, verified candidate information.
- **Cloud Run & Firebase:** Serverless, auto-scaling deployment with persistent session tracking.

---

## 📌 Assumptions Made
- The application targets Indian state and general elections.
- Polling booth search uses Google Places API as a proxy (since the official ECI API is not publicly accessible).
- Sessions are completely anonymous — no personal data is stored beyond the scope of the active session.

## ⚙️ Run Locally
```bash
git clone [repo-url]
cd civiq
cp .env.example .env
# Fill in all API keys in .env
npm install
npm run dev          # starts Vite client on :5173
npm run server       # starts Express backend on :8081
```

## 🧪 Run Tests
```bash
npm test
```

---

*Built for Google Antigravity Hackathon 2026.*
