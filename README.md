<h1 align="center">✨ Fullstack Chat & Video Calling App ✨</h1>

**Overview**

- **Purpose:** Real-time chat, 1:1 and group video calls, screen sharing, recording, and a language-exchange UI with many themes.
- **Stack:** **React** (Vite) frontend, **Express** backend, **MongoDB**, **TailwindCSS**, **Stream** for chat/video, **Zustand** for state.

---

**Quick Start**

- **Install dependencies & build (root):** `npm run build`
- **Start backend (dev):**

	```bash
	cd backend
	npm install
	npm run dev
	```

- **Start frontend (dev):**

	```bash
	cd frontend
	npm install
	npm run dev
	```

---

**Environment Variables**

- **Backend:** create a `.env` in `backend/` with at minimum:

	```env
	PORT=5001
	MONGO_URI=your_mongo_uri
	STREAM_API_KEY=your_stream_api_key
	STREAM_API_SECRET=your_stream_api_secret
	JWT_SECRET_KEY=your_jwt_secret
	FRONTEND_URL=http://localhost:5173
	NODE_ENV=development
	# Email settings (see docs)
	EMAIL_HOST=...
	EMAIL_USER=...
	EMAIL_PASSWORD=...
	EMAIL_FROM=...
	```

- **Frontend:** create a `.env` in `frontend/` (Vite) with:

	```env
	VITE_STREAM_API_KEY=your_stream_api_key
	```

Refer to the backend email guides for full email configuration: [backend/EMAIL_SETUP_GUIDE.md](backend/EMAIL_SETUP_GUIDE.md) and [backend/EMAIL_VALIDATION.md](backend/EMAIL_VALIDATION.md).

---

**Useful Commands**

- **Root:** `npm run build` — installs both sub-projects and builds frontend
- **Backend dev:** `npm run dev` (in `backend`)
- **Backend start:** `npm start` (in `backend`)
- **Frontend dev:** `npm run dev` (in `frontend`)
- **Preview production build:** `npm run preview` (in `frontend`)

---

**Important Files**

- **Backend entry:** [backend/src/server.js](backend/src/server.js#L1)
- **Email setup & validation:** [backend/EMAIL_SETUP_GUIDE.md](backend/EMAIL_SETUP_GUIDE.md), [backend/EMAIL_VALIDATION.md](backend/EMAIL_VALIDATION.md)
- **Frontend entry:** [frontend/src/main.jsx](frontend/src/main.jsx)

---

**Features**

- **Authentication:** JWT-based signup/login with email verification
- **Real-time chat:** using Stream
- **Video calls:** 1:1 and group via Stream Video SDK
- **File uploads:** `backend/uploads` served at `/uploads`
- **Security:** Helmet, rate limiting, input sanitization

---

**Email Verification & Stream User Creation**

The app validates and requires email verification before creating Stream users (prevents fake accounts). See [backend/EMAIL_VALIDATION.md](backend/EMAIL_VALIDATION.md) for full details and recommended production setups.

---

**Docker / Production Notes**

- A `backend/Dockerfile` exists for containerizing the backend. Ensure environment variables are provided to the container at runtime.
- In production, the backend serves the frontend static build from `backend/src/server.js` when `NODE_ENV=production`.

---

**Testing & Utilities**

- Email test helper: `node backend/test-email.js`
- Server health: `GET /health` (defaults to `http://localhost:5001/health`)

---

**Contributing**

- Open an issue or submit a PR. Run linters and keep changes focused.

---

**License**

- MIT (or add your preferred license)

---

If you'd like, I can also:

- Add a `.env.example` file
- Add a single-command script to start both services for development
- Create a short Developer Setup section with step-by-step screenshots


