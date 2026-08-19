# 🚀 TaskFlow: Full-Stack MERN Task Management Application

A secure, modern, full-stack Task Management application built using the **MERN Stack (MongoDB, Express.js, React + Vite, Node.js)**. Features JWT authentication, multipart file uploads with Cloudinary, automated email dispatching with Nodemailer, live weather context via OpenWeatherMap, dynamic Kanban & Grid views, advanced filtering, and pagination.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **JWT Authentication**: Secure user registration and login issuing signed JSON Web Tokens.
- **Password Protection**: BCryptJS hashing with salt rounds before database persistence.
- **Strict Data Isolation**: Tasks are strictly bound to the authenticated user's ID (`req.user._id`).
- **Route Guards**: Backend protection middleware and React Protected Route guards.
- **1-Click Demo Login**: Instantly test the application without manual signup.

### 📋 2. Comprehensive Task Management (CRUD)
- **Rich Task Attributes**: Title, detailed description, status (`PENDING`, `IN_PROGRESS`, `DONE`), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), due dates, location (city/place), tags, and file attachments.
- **Dual Visual Modes**:
  - **Grid / Card View**: Responsive cards displaying tags, overdue warnings, and download links.
  - **Kanban Board View**: Interactive 3-column workflow (To Do, In Progress, Done) with quick status shifts.
- **Summary Metrics Dashboard**: Real-time counters for Total Tasks, In Progress, Completed, Overdue, and Completion Rate percentage.

### 🔍 3. Advanced Querying & Filtering
- **Dynamic Search**: Instant debounced search querying across task titles, descriptions, and locations.
- **Multi-Filter Bar**: Filter simultaneously by status, priority level, and date ranges.
- **Sorting Options**: Sort by newest, oldest, due date (soonest), or alphabetically.
- **Page-Based Pagination**: Clean page navigation with configurable limit headers.

### 🌐 4. Third-Party Integrations
- **Live Weather Integration (OpenWeatherMap API)**:
  - Fetches real-time temperature, condition descriptions, and weather icons for any task location.
  - Features in-memory caching to avoid redundant API calls and respect rate limits.
  - Real-time weather forecast preview chip in the creation modal as you type a city name.
- **File Storage (Cloudinary + Local Fallback)**:
  - Attach images, PDFs, Word docs, Excel sheets, and text documents up to 10MB.
  - Uploads to Cloudinary with fallback local storage handling so it works out-of-the-box in any environment.
- **Automated Email Notifications (Nodemailer / SMTP)**:
  - **Task Created Confirmation**: Sends formatted HTML email detailing task title, priority, due date, and location.
  - **Task Completed Notification**: Sends celebratory email upon task status transitioning to `DONE`.
  - **Welcome Email**: Sent upon new user account registration.

---

## 🛠️ Tech Stack Specifications

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | MongoDB + Mongoose | NoSQL document storage and schema modeling |
| **Backend** | Node.js + Express.js | RESTful API server, routing, and controllers |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` | Stateless session tokens & secure hashing |
| **File Storage** | Multer + Cloudinary (`cloudinary`, `streamifier`) | Multipart buffer upload with local fallback |
| **Email Service** | Nodemailer | Transactional email notifications |
| **Weather API** | Axios + OpenWeatherMap REST API | Real-time weather data and forecast lookup |
| **Frontend** | React 18 + Vite | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS + Lucide React | Modern responsive design system & dark/light theme |
| **Routing** | React Router DOM v6 | Protected client-side navigation |
| **HTTP Client** | Axios | Configured with automatic JWT request interceptors |

---

## 📁 Directory Architecture

```
task-management-mern/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Mongoose database connection
│   │   └── cloudinary.js         # Cloudinary configuration & upload handler
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Profile handlers
│   │   └── taskController.js     # Task CRUD, filtering, pagination, metrics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token authentication guard
│   │   ├── uploadMiddleware.js   # Multer file upload handling (10MB limit)
│   │   └── errorMiddleware.js    # Centralized 404 and 500 error handler
│   ├── models/
│   │   ├── User.js               # User Schema with bcrypt password hooks
│   │   └── Task.js               # Task Schema with user references & indexes
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   └── taskRoutes.js         # /api/tasks endpoints
│   ├── utils/
│   │   ├── emailService.js       # Nodemailer HTML template email dispatcher
│   │   ├── weatherService.js     # OpenWeatherMap API wrapper with caching
│   │   └── generateToken.js      # JWT signing utility
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation header with dark mode toggle
│   │   │   ├── ProtectedRoute.jsx# Auth route guard
│   │   │   ├── StatsOverview.jsx # Metrics & progress cards
│   │   │   ├── TaskCard.jsx      # Interactive task card component
│   │   │   ├── TaskFormModal.jsx # Task create/edit modal with file upload
│   │   │   ├── TaskDetailModal.jsx# Task overview & attachment preview modal
│   │   │   ├── KanbanBoard.jsx   # 3-column Kanban workflow board
│   │   │   ├── WeatherBadge.jsx  # Live weather chip component
│   │   │   └── Toast.jsx         # Non-intrusive feedback toast notifications
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user auth state
│   │   │   └── ThemeContext.jsx  # Dark/Light theme state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Login view with 1-click demo
│   │   │   ├── RegisterPage.jsx  # User signup view
│   │   │   ├── DashboardPage.jsx # Main task workspace (Grid & Kanban)
│   │   │   └── NotFoundPage.jsx  # 404 Fallback view
│   │   ├── services/
│   │   │   └── api.js            # Axios instance with Bearer interceptors
│   │   ├── App.jsx               # Application routes
│   │   ├── index.css             # Tailwind base & glassmorphism utilities
│   │   └── main.jsx              # React DOM entry point
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json                  # Root runner script
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18.x or v20.x LTS)
- MongoDB instance (Local MongoDB or free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas))

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/task-management-mern.git
cd task-management-mern

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection (Local or Atlas URI)
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Cloudinary (Optional - has local storage fallback)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenWeatherMap (Optional - has fallback simulator)
OPENWEATHER_API_KEY=your_openweather_api_key

# Nodemailer / SMTP (Optional - logs to console in dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=TaskFlow <no-reply@taskflow.app>
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=/api
```

### 3. Run Locally in Development Mode
From the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Dashboard**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📡 REST API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account with `name`, `email`, `password` |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update name or password |

### Task Endpoints (`/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tasks` | Private | Fetch tasks with filters (`status`, `priority`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `page`, `limit`) |
| `GET` | `/api/tasks/stats/summary` | Private | Fetch aggregated task metrics (total, pending, in-progress, done, overdue, completion rate) |
| `GET` | `/api/tasks/weather/preview?city=...` | Private | Live weather lookup for location preview |
| `GET` | `/api/tasks/:id` | Private | Get single task details |
| `POST` | `/api/tasks` | Private | Create task with multipart form file attachment |
| `PUT` | `/api/tasks/:id` | Private | Update task fields / attachment / status |
| `DELETE` | `/api/tasks/:id` | Private | Delete task permanently |

---

## 🚀 Deployment Guide

### Backend Deployment (Render / Railway)
1. Push the codebase to your GitHub repository.
2. In [Render](https://render.com/), create a new **Web Service** pointing to the repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `OPENWEATHER_API_KEY`, `EMAIL_*`, `CLIENT_URL`).

### Database Deployment (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with password.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`).
4. Copy the connection string and paste into `MONGO_URI`.

### Frontend Deployment (Vercel / Netlify)
1. In [Vercel](https://vercel.com/), import the repository.
2. Set **Root Directory** to `frontend`.
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`

---

## 💡 Trade-offs & Future Enhancements
- **WebSockets / Server-Sent Events (SSE)**: For multi-device real-time sync across active sessions.
- **Recurring Tasks & Reminders**: Cron scheduler for overdue task alert emails.
- **Drag-and-Drop Kanban**: Integration with `@hello-pangea/dnd` for fluid visual dragging across columns.
- **OAuth Social Login**: Google and GitHub OAuth 2.0 single sign-on.
