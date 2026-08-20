# SocietyHub - Enterprise Society Management System (MERN Stack)

A full-stack, enterprise-grade **Society Management System** built with **MongoDB, Express.js, React 18 (Vite), Node.js, Redux Toolkit, and Tailwind CSS**. The system delivers a modern, glassmorphic UI with dedicated portals for **Super Admins**, **Society Admins (Secretaries)**, and **Resident Members**.

---

## 🚀 Key Features

### 👑 1. Super / Main Admin Portal
- **Platform Analytics**: Multi-society governance, cross-society occupancy, and cumulative maintenance inflow trend visualizers.
- **Societies Directory**: Onboard new residential complexes with custom billing cycles, late fee penalties, and wing structures.
- **Secretary Appointments**: Delegate society administration with full role-based access control.
- **Financial & Operational Reports**: Comprehensive cashflow in-out graphs and expense category breakdowns.

### 🏢 2. Society Admin (Secretary) Portal
- **Dashboard**: Live collection meters, pending dues tracker, open tickets SLA tracker, and urgent announcements.
- **Resident Directory**: Full member roster with Wing/Flat search, owner/tenant badges, and instant CSV export.
- **Complaints & Helpdesk**: Ticket lifecycle tracking (`pending` ➔ `assigned` ➔ `in_progress` ➔ `resolved`), technician assignment, admin remarks, and live threaded comments.
- **Maintenance & Defaulters**: Monthly batch billing generator with breakdown, automated late fee calculator, and overdue defaulters list.
- **Payments & Receipts**: Full payment ledger, manual offline cash/cheque recording, and automated PDFKit official receipt generator.
- **Society Expenditures**: Record vendor bills (elevators, security payroll, electricity, gardening) with approval workflows.
- **Notice Board Broadcasts**: Broadcast announcements with priority tags (`urgent`, `high`, `medium`) and top-pinned circulars.
- **Community Engagement**: Schedule festivals with RSVP tracking, launch resident opinion voting polls, and upload bylaws & audited balance sheets.

### 👥 3. Resident Member Portal
- **My Flat Dashboard**: Quick overview of pending maintenance dues, active complaint tickets, society notices, and gate intercoms.
- **Online Maintenance Checkout**: Pay monthly maintenance securely via simulated UPI/Cards/NetBanking gateway and download official PDF receipts.
- **Helpdesk Ticket Submission**: File maintenance/plumbing/security complaints with photo attachments and message society office directly.
- **Notice Board**: View pinned society notices with unread markers and priority badges.
- **Community Events & RSVPs**: RSVP for society cultural festivals and AGMs.
- **Resident Polls & Voting**: Vote on solar upgrades, clubhouse timings, and view live percentage visualizers.
- **Flat & Family Profile**: Manage registered family members, emergency contacts, and vehicle license plates.

### ⚡ 4. 1-Click Test Drive Switcher
A persistent floating banner at the top of every screen allows instant 1-click switching between Super Admin, Society Admin, and Resident Member without typing passwords.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@societyhub.com` | `password123` | Master Platform Control |
| **Society Admin** | `admin@emeraldheights.com` | `password123` | Col. Rajesh Bakshi (Secretary) |
| **Resident Member** | `rahul.sharma@gmail.com` | `password123` | Rahul Sharma (Flat A-402, Owner) |
| **Defaulter Resident** | `vikram.patel@gmail.com` | `password123` | Vikram Patel (Flat C-301, Tenant) |
| **Staff Member** | `suresh.staff@emeraldheights.com` | `password123` | Suresh Kumar (Electrician/Plumber) |

> **Mobile OTP Login**: Enter any registered mobile number (e.g. `9876543210`) and enter demo OTP **`123456`**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Tailwind CSS, Lucide React, Recharts, React Hot Toast
- **Backend**: Node.js (v18+ / v22), Express.js, MongoDB (Mongoose ODM), JWT, Bcrypt.js, Multer, PDFKit, Socket.io, Helmet, CORS, Morgan
- **Database**: MongoDB with automatic In-Memory fallback (`mongodb-memory-server`) & zero-config automated database seeding.

---

## 📦 Project Structure

```
society-management/
├── client/                           # React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/                      # Axios HTTP client & API services
│   │   ├── components/               # Navbar, Sidebar, Layout, DemoBanner, Modals, StatCards
│   │   ├── context/                  # ThemeContext (Dark/Light), SocketContext
│   │   ├── pages/
│   │   │   ├── auth/                 # Login (Password & Mobile OTP)
│   │   │   ├── main-admin/           # Dashboard, Societies, Admins, Reports
│   │   │   ├── society-admin/        # Dashboard, Members, Complaints, Maintenance, Payments, Expenses, Notices, Events, Polls, Documents
│   │   │   └── member/               # Dashboard, Payments (Checkout + PDF), Complaints, Notices, Events, Polls, Documents, Profile
│   │   ├── redux/                    # Redux Toolkit store & slices
│   │   ├── styles/                   # Glassmorphic Tailwind CSS design system
│   │   ├── App.jsx & routes.jsx      # Protected RBAC routing
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                           # Express.js REST API Backend
    ├── src/
    │   ├── config/                   # MongoDB connection & Seed generator
    │   ├── controllers/              # RESTful API controllers
    │   ├── middleware/               # JWT auth, RBAC authorization, Multer, Error handlers
    │   ├── models/                   # Society, User, Complaint, Maintenance, Payment, Expense, Notification, Event, Poll, Document, AuditLog
    │   ├── routes/                   # Clean Express route modules
    │   ├── services/                 # PDFKit receipt generator & Payment service
    │   ├── app.js & server.js        # Server bootstrap & Socket.io listeners
    └── package.json
```

---

## 🚀 Running the Project Locally

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
*Server runs at `http://localhost:5000` (automatically connects to MongoDB and seeds initial demo data).*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173` with Vite hot module replacement.*

---

## 📡 Key API Endpoints

- `POST /api/auth/login`: Email & Password authentication
- `POST /api/auth/otp-login` & `/api/auth/verify-otp`: Mobile OTP authentication
- `GET /api/societies/stats`: Aggregated dashboard metrics & chart data
- `GET /api/society/members`: Resident directory with wing and ownership filters
- `GET /api/society/complaints` & `POST /api/society/complaints`: Complaint tickets with threaded comments
- `GET /api/society/maintenance/defaulters`: Overdue resident defaulters with late fee penalties
- `POST /api/member/payments/verify`: Process maintenance checkout
- `GET /api/payments/receipt/:id`: Download certified PDFKit invoice receipt