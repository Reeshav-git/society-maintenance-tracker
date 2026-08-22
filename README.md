# Society Maintenance Tracker

A full-stack platform for apartment societies to manage maintenance complaints, track status history, post notices, and notify residents via email.

## Overview

Residents can register, raise complaints with optional photos, and track progress. Admins manage complaints through a workflow (Open → In Progress → Resolved), set priorities, detect overdue issues, post notices, and view dashboard statistics.

## Features

- **Authentication** — JWT-based login with resident and admin roles
- **Complaints** — Create, view, filter; category, description, optional photo
- **Status history** — Every status change recorded with timestamp, actor, and note
- **Priority** — Admin sets Low / Medium / High
- **Overdue detection** — Configurable threshold flags unresolved complaints
- **Notice board** — Admin posts notices; important ones pinned to top
- **Email notifications** — Status updates and important notices (Resend)
- **Dashboard** — Stats by status, category, and overdue count
- **Photo upload** — Cloudinary integration (URL stored in MongoDB)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Photos | Cloudinary |
| Email | Resend |

## Project Structure

```
society-maintenance-tracker/
├── backend/
│   ├── config/          # DB, Cloudinary
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, file upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Admin seed script
│   ├── utils/           # Helpers (email, overdue, etc.)
│   └── server.js
├── frontend/            # React app (Vite)
├── README.md
├── SYSTEM_DESIGN.md
├── .env.example
└── .gitignore
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account (for photos)
- Resend account (for emails)

### 1. Clone the repository

```bash
git clone <repository-url>
cd society-maintenance-tracker
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, and other values in .env
npm run seed:admin
npm start
```

Server runs at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_EMAIL` | Default admin email for seed script |
| `ADMIN_PASSWORD` | Default admin password for seed script |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address for emails |
| `OVERDUE_DAYS` | Days before complaint is flagged overdue (default: 3) |

## Test Accounts

After running `npm run seed:admin`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@society.com | admin123 |

Register a resident via `POST /api/auth/register`.

## Database Schema

### Users

| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name |
| email | String | Unique, lowercase |
| password | String | Hashed (bcrypt) |
| role | String | `resident` or `admin` |
| apartmentNumber | String | Required for residents |
| createdAt, updatedAt | Date | Timestamps |

### Complaints

| Field | Type | Description |
|-------|------|-------------|
| complaintId | String | e.g. CMP-0001 |
| resident | ObjectId | Ref → User |
| category | String | Plumbing, Electrical, etc. |
| description | String | Complaint details |
| photoUrl | String | Cloudinary URL |
| status | String | OPEN, IN_PROGRESS, RESOLVED |
| priority | String | LOW, MEDIUM, HIGH |
| isOverdue | Boolean | Computed flag |
| isClosed | Boolean | True when resolved |
| history | Array | Status change log (see below) |
| createdAt, updatedAt | Date | Timestamps |

**History entry:**

| Field | Type | Description |
|-------|------|-------------|
| status | String | Status at this point |
| changedBy | ObjectId | Ref → User |
| note | String | Optional admin note |
| timestamp | Date | When change occurred |

### Notices

| Field | Type | Description |
|-------|------|-------------|
| title | String | Notice title |
| description | String | Notice body |
| isImportant | Boolean | Pinned to top if true |
| createdBy | ObjectId | Ref → User (admin) |
| createdAt, updatedAt | Date | Timestamps |

## API Documentation

Base URL: `http://localhost:5000`

Protected routes require header: `Authorization: Bearer <token>`

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register resident |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Current user |

**Register body:**
```json
{
  "name": "Rahul",
  "email": "rahul@gmail.com",
  "password": "test123",
  "apartmentNumber": "A-203"
}
```

**Login body:**
```json
{
  "email": "rahul@gmail.com",
  "password": "test123"
}
```

### Complaints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/complaints` | Resident | Create complaint |
| GET | `/api/complaints/my` | Resident | Own complaints |
| GET | `/api/complaints/:id` | Both | Complaint details + history |
| GET | `/api/complaints` | Admin | All complaints (filters) |
| PUT | `/api/complaints/:id/status` | Admin | Update status |
| PUT | `/api/complaints/:id/priority` | Admin | Update priority |

**Create complaint (JSON):**
```json
{
  "category": "Plumbing",
  "description": "Leaking tap in kitchen"
}
```

**Create with photo:** use `multipart/form-data` with fields `category`, `description`, and file field `photo`.

**Admin filters:** `?category=Plumbing&status=OPEN&fromDate=2026-08-01&toDate=2026-08-22&overdue=true`

**Update status:**
```json
{
  "status": "IN_PROGRESS",
  "note": "Technician assigned"
}
```

**Update priority:**
```json
{
  "priority": "HIGH"
}
```

### Notices

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/notices` | Both | List notices (important first) |
| POST | `/api/notices` | Admin | Create notice |
| PUT | `/api/notices/:id` | Admin | Update notice |
| DELETE | `/api/notices/:id` | Admin | Delete notice |

**Create notice:**
```json
{
  "title": "Water Supply Maintenance",
  "description": "Water unavailable 10 AM to 2 PM",
  "isImportant": true
}
```

### Dashboard

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Admin | Statistics |

**Response:**
```json
{
  "total": 45,
  "open": 12,
  "inProgress": 18,
  "resolved": 15,
  "overdue": 5,
  "overdueDays": 3,
  "categories": {
    "Plumbing": 12,
    "Electrical": 8
  }
}
```

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server and MongoDB status |

## Running Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

## Hosted Application

| Service | URL |
|---------|-----|
| Frontend | _Deploy to Vercel — Phase 13_ |
| Backend | _Deploy to Render — Phase 13_ |
| GitHub | _Add repository URL after Phase 12_ |

## System Design

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the 800-word write-up covering complaint history, overdue detection, photo handling, and notification flow.

## Future Enhancements

- React frontend pages for all modules
- Push notifications
- Complaint reassignment to staff
- Export dashboard reports as PDF
- Multi-society support
