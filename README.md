# Civiq

Civiq is an AI-assisted civic education web app focused on Indian elections. It guides users through a practical journey: registration checks, booth discovery, candidate lookup, ballot understanding, and reminder setup.

## Highlights

- React + Vite single page application
- Express backend proxy for Gemini, Maps, Search, TTS, and quiz generation
- Adaptive chat behavior (confused, skeptical, engaged, neutral)
- Optional Firestore session persistence via Firebase Admin
- Caching for Maps and Custom Search routes
- Jest + React Testing Library test setup with CI workflow

## Tech Stack

- Frontend: React 18, React Router 6, Vite, Tailwind, Framer Motion
- Backend: Express 5, Helmet, CORS, Compression, Express Rate Limit
- AI and APIs: Gemini API, Google Maps API, Google Custom Search, Google Text-to-Speech, Google Calendar
- Data: Firebase client SDK and optional Firebase Admin (Firestore)
- Testing: Jest, Babel, React Testing Library

## Repository Structure

```text
.
|- src/
|  |- components/
|  |- hooks/
|  |- pages/
|  |- services/
|  |- tests/
|- server/
|  |- lib/
|  |- middleware/
|  |- routes/
|- public/
|- .github/workflows/test.yml
|- package.json
```

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm 9+
- Google API credentials for the services you plan to use
- Firebase project credentials if you want Firestore writes

## Environment Variables

Copy .env.example to .env and fill values.

Current .env.example includes:

```env
GEMINI_API_KEY=
VITE_MAPS_KEY=
VITE_CALENDAR_CLIENT_ID=
VITE_FIREBASE_CONFIG=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Additional server variables used by routes (recommended to add in .env):

```env
PORT=8081
GEMINI_MODEL=
GEMINI_CHAT_MODEL=
GEMINI_QUIZ_MODEL=
MAPS_API_KEY=
TTS_API_KEY=
SEARCH_API_KEY=
SEARCH_ENGINE_ID=
```

Notes:

- FIREBASE_PRIVATE_KEY should keep escaped newlines (\\n) in .env.
- VITE_FIREBASE_CONFIG is expected as a JSON string for frontend initialization.
- Frontend service files currently call backend at http://localhost:8081 directly.

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev:full
```

Or run separately:

```bash
npm run dev
npm run server
```

Default ports:

- Frontend (Vite): 5173
- Backend (Express): 8081 unless PORT is set

Health check:

```text
GET http://localhost:8081/api/chat/health
```

## Available Scripts

- npm run dev: start Vite dev server
- npm run server: start Express backend
- npm run dev:server: start backend with file watch
- npm run dev:full: run frontend and backend together
- npm run build: create production frontend build
- npm run preview: preview built frontend
- npm run lint: run ESLint
- npm test: run Jest with coverage
- npm start: start backend server (production style)

## API Endpoints

All backend endpoints are under /api.

- GET /api/chat/health
- POST /api/chat
- GET /api/maps/booth?lat=&lng=&pincode=
- GET /api/search/candidates?state=&constituency=
- POST /api/tts
- POST /api/quiz/generate

## Testing and CI

Run tests locally:

```bash
npm test
```

CI workflow exists at .github/workflows/test.yml and runs:

- npm ci
- npm run lint
- npm test

## Build and Deployment

Build frontend bundle:

```bash
npm run build
```

Production server serves files from dist and also exposes API routes.

Docker:

- Multi-stage Dockerfile is included.
- Container exposes port 8080.
- Ensure runtime PORT and API env vars are set in your deployment platform.

## Security and Reliability

- Helmet CSP configuration enabled
- API rate limiting at /api/\*
- Gzip/Brotli-style compression middleware
- Graceful shutdown handling for SIGINT and SIGTERM
- Firestore persistence fails safely when Firebase Admin credentials are missing

## Known Limitations

- Frontend service files use hardcoded backend base URL http://localhost:8081, so production deployments should either:
  - refactor to environment-based API base URL, or
  - run frontend and backend on same origin with compatible routing
- Election reminder dates in calendar service are static and should be updated as schedules change

## Troubleshooting

- Port already in use: change PORT or stop existing process
- Blank AI responses: verify GEMINI*API_KEY and GEMINI*\* model vars
- Maps/search issues: verify MAPS_API_KEY, SEARCH_API_KEY, SEARCH_ENGINE_ID
- TTS failures: verify TTS_API_KEY and API enablement in Google Cloud
- Firestore write warnings: add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

## License

No license file is currently included. Add a LICENSE file if you plan to open-source distribution terms.
