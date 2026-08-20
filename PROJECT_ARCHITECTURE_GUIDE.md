# MERN Task Management Project: Beginner's Complete Architecture Guide

Welcome! This guide explains every part of this full-stack project in plain, simple terms: how the **Frontend**, **Backend**, and **Database** work, how they **communicate with each other**, and how all the **configurations** fit together.

---

## 📑 Table of Contents
1. [High-Level Architecture (The Big Picture)](#1-high-level-architecture-the-big-picture)
2. [Frontend (React + Vite + Tailwind CSS)](#2-frontend-client-side)
3. [Backend (Node.js + Express.js)](#3-backend-server-side)
4. [Database (MongoDB & JSON Fallback Store)](#4-database-data-persistence)
5. [How They Connect & Communicate](#5-how-they-connect--communicate)
   - [API Request/Response Cycle](#api-requestresponse-cycle)
   - [JWT Authentication Flow](#jwt-authentication-flow)
   - [CORS (Cross-Origin Resource Sharing)](#cors-cross-origin-resource-sharing)
6. [Configurations & Environment Variables](#6-configurations--environment-variables)
7. [Running the Application](#7-running-the-application)
8. [Summary Cheat Sheet](#8-summary-cheat-sheet)

---

## 1. High-Level Architecture (The Big Picture)

This application uses the **MERN** stack:
- **M (MongoDB)**: Stores data (users, tasks, categories, settings).
- **E (Express.js)**: Server web framework for routing requests and business logic.
- **R (React.js)**: Client-side library for user interfaces and page views.
- **N (Node.js)**: JavaScript runtime powering the server.

```
┌────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                      │
│  Frontend: React + Vite + Tailwind CSS                │
│  Port: http://localhost:5173                          │
└───────────────────────────┬────────────────────────────┘
                            │  1. HTTP Requests (JSON + JWT Token)
                            │     via Axios (/api/...)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS                   │
│  Backend REST API Server                              │
│  Port: http://localhost:5000                          │
│  - Routes (/api/auth, /api/tasks)                      │
│  - Middleware (Auth verification, Error handling)      │
│  - Controllers (Business logic, validation)            │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              │ 2. Queries & Updates      │ 3. External Services
              ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│         DATABASE          │   │ - Weather API (OpenWeather│
│  MongoDB (Mongoose) /     │   │ - Cloudinary File Storage │
│  JSON Store Fallback      │   │ - Nodemailer (Email Alert)│
└───────────────────────────┘   └───────────────────────────┘
```

---

## 2. Frontend (Client-Side)

**Folder Location**: `frontend/`

The frontend is what the user sees in their web browser.

### Key Directories & Files:
- **`src/main.jsx`**: The starting entry point for React. Mounts the React app onto `index.html`.
- **`src/App.jsx`**: Defines all page routes (using React Router):
  - `/` & `/dashboard` -> Dashboard page
  - `/login` -> Login page
  - `/register` -> Registration page
  - `/analytics` -> Task analytics and charts
  - `/calendar` -> Calendar view of task deadlines
- **`src/context/AuthContext.jsx`**: Global state management for user authentication.
  - Keeps track of whether a user is logged in.
  - Stores user profile info and JWT auth tokens in `localStorage`.
- **`src/services/api.js`**: Centralized **Axios** configuration.
  - Sends all requests to the backend (`/api/...`).
  - **Request Interceptor**: Automatically attaches the user's JWT token to every request header (`Authorization: Bearer <token>`).
  - **Response Interceptor**: If the backend returns a `401 Unauthorized` (expired session), it clears local storage and redirects the user to the login screen.
- **`src/pages/`**: Contains the main screen layouts (`Dashboard.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `AnalyticsPage.jsx`, `CalendarPage.jsx`).
- **`src/components/`**: Reusable UI blocks:
  - `Navbar.jsx`: Top navigation and user avatar menu.
  - `TaskCard.jsx`: Individual task item with priority badges, status toggles, and edit/delete actions.
  - `TaskModal.jsx`: Pop-up dialog to create and edit tasks.
  - `FilterBar.jsx`: Search, status filter, and priority sorting.
  - `WeatherWidget.jsx`: Weather forecast component.

---

## 3. Backend (Server-Side)

**Folder Location**: `backend/`

The backend handles requests, performs security checks, validates user data, and talks to the database.

### Key Directories & Files:
- **`server.js`**: The main entry point of the server.
  - Loads environment variables from `.env`.
  - Configures Express middlewares (`express.json()`, `cors()`, `rateLimit()`, `morgan()`).
  - Connects to the database via `connectDB()`.
  - Mounts API routes under `/api/auth` and `/api/tasks`.
  - Starts the web server listening on port `5000`.
- **`routes/`**:
  - `authRoutes.js`: Endpoints for user signup, login, profile retrieval, and updates.
  - `taskRoutes.js`: Endpoints for CRUD operations on tasks (create, read, update, delete, stats, weather).
- **`controllers/`**:
  - `authController.js`: Encrypts passwords using `bcryptjs`, authenticates users, and generates JWT tokens.
  - `taskController.js`: Implements the core task logic (filtering by priority/status/tags, pagination, search, statistics, file attachments).
- **`middleware/`**:
  - `authMiddleware.js`: Protects private routes. Extracts the JWT token from the `Authorization` header, verifies its cryptographic signature, and loads the corresponding user into `req.user`.
  - `errorMiddleware.js`: Catches errors and formats them into clean JSON error responses instead of crashing the server.

---

## 4. Database (Data Persistence)

**Folder Location**: `backend/models/` and `backend/config/db.js`

The database stores all persistent data so nothing is lost when the server restarts.

### How Data is Modeled:
1. **`models/User.js`**:
   - `name`: User's full name.
   - `email`: Unique email address.
   - `password`: Securely hashed password (never stored in plain text).
   - `avatar`: URL to avatar image.
   - `role`: User role (`user` or `admin`).
2. **`models/Task.js`**:
   - `title`: Short task title.
   - `description`: Detailed task notes.
   - `status`: `'Pending'`, `'In-Progress'`, or `'Completed'`.
   - `priority`: `'Low'`, `'Medium'`, `'High'`, or `'Critical'`.
   - `dueDate`: Date and time the task is due.
   - `tags`: Array of labels (e.g. `["frontend", "bug", "urgent"]`).
   - `attachments`: Uploaded files and images.
   - `user`: Reference linking the task to the User who created it.

### Zero-Downtime Fallback Mechanism:
- If a MongoDB instance (local or MongoDB Atlas cloud) is available, `connectDB()` connects to MongoDB via Mongoose.
- If MongoDB is not running, the application automatically falls back to an embedded JSON storage engine (`backend/models/store.js` + `backend/data/store.json`), allowing full functionality without any setup friction.

---

## 5. How They Connect & Communicate

### API Request/Response Cycle

```
[ User clicks "Add Task" in React ]
                 │
                 ▼
1. React Component handles the form submit
                 │
                 ▼
2. frontend/src/services/api.js makes an HTTP POST request:
   URL: http://localhost:5000/api/tasks
   Header: Authorization: Bearer <jwt_token>
   Body: { "title": "Buy Groceries", "priority": "High", ... }
                 │
                 ▼
3. backend/server.js receives the request and routes to taskRoutes.js
                 │
                 ▼
4. authMiddleware.js verifies the JWT token and identifies the user
                 │
                 ▼
5. taskController.js validates fields & creates task in Database (Mongoose/Store)
                 │
                 ▼
6. Backend responds with HTTP 201 Created and the new task JSON object
                 │
                 ▼
7. React receives the JSON, updates its state, and renders the new task card on screen
```

### JWT Authentication Flow

1. **Register/Login**: User sends email + password to `/api/auth/login`.
2. **Password Verification**: Backend hashes the input password and compares it with the stored hash using `bcrypt`.
3. **Token Creation**: If valid, backend generates a signed **JWT (JSON Web Token)** containing the user's ID:
   `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })`
4. **Token Storage**: Frontend saves the token in browser `localStorage`.
5. **Subsequent Calls**: For every private request (e.g. create task, delete task), frontend sends the token in the header:
   `Authorization: Bearer <token>`
6. **Backend Verification**: Backend checks if the token is valid before granting access.

### CORS (Cross-Origin Resource Sharing)

Because the Frontend runs on `http://localhost:5173` and the Backend runs on `http://localhost:5000`, browsers consider this a "cross-origin" request.
- The backend uses the `cors` middleware in `server.js` to whitelist `http://localhost:5173`.
- The frontend `vite.config.js` configures a development proxy that forwards `/api` requests directly to `http://localhost:5000`.

---

## 6. Configurations & Environment Variables

### Root Configuration (`package.json`)
Allows running both frontend and backend concurrently with one command:
```json
"scripts": {
  "server": "cd backend && npm run dev",
  "client": "cd frontend && npm run dev",
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
}
```

### Backend Configuration (`backend/.env`)
| Variable | Purpose | Example |
| :--- | :--- | :--- |
| `PORT` | The port the Node.js server listens on | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URI` | Connection string for MongoDB | `mongodb://127.0.0.1:27017/taskmanager` |
| `JWT_SECRET` | Secret key used to encrypt/sign tokens | `your_secure_secret_key_here` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `CLOUDINARY_*` | *(Optional)* Cloud image and file hosting | Cloudinary API keys |
| `OPENWEATHER_API_KEY` | *(Optional)* Live weather forecast API key | OpenWeather API key |

### Frontend Configuration (`frontend/.env`)
| Variable | Purpose | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API route prefix for Axios | `/api` |

---

## 7. Running the Application

1. **Install all dependencies** (run once from project root):
   ```bash
   npm run install:all
   ```

2. **Start both Frontend and Backend concurrently**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Frontend UI: `http://localhost:5173`
   - Backend API Health: `http://localhost:5000/api/health`

---

## 8. Summary Cheat Sheet

| Layer | Technology | Primary Role |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons | Renders screens, manages user state, sends API calls |
| **HTTP Client** | Axios | Sends requests with Bearer tokens and handles responses |
| **Backend** | Node.js, Express.js | Exposes REST APIs, checks security, executes business logic |
| **Authentication** | JWT (JSON Web Tokens) & Bcrypt | Password encryption & stateless authentication |
| **Database** | MongoDB (Mongoose) + Fallback Store | Long-term data storage for users and tasks |
| **Environment** | `dotenv` (.env files) | Keeps secrets and configuration variables secure |
