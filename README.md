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






















1) Member can attach image from his/her file storage in Complaints and Tickets section (instead of pasting URL of image)
2) In particaular there is section to chat between member & admin. In this section when member sends message then it will reflect immediately in admin message like in chatting application Include live chatting in using Socket programming, then add the message into database.
3) Same in notification. When admin add the notification then it with reflect immediately in members dashboard (Using socket programming)
4) when member try to download maintenance reciept then gives an error...
{"success":false,"message":"Not authorized to access this resource. Please log in."}
5) in Society Bylaws & Guidelines section - Society admin can attach [excel file, csv file, pdf, docs etc.] from his/her file storage and members can see the document and can download the document
6) Razorpay is not included - when member click on to pay maintenance then it gives payment success message directly
7) When society admin adds the member then system don't asks for password and when member wants to login then system asks for email and password.
8) There is one bug that society admin can switch the role to main admin and member. (This is wrong because user need to enter details for super admin or member to switch the role)
9) When Super admin adds the society secretary then it don't ask for password, and when society secretary wants to login then it asks for email & password.
10) Also same with society admin, when he adds the resident then it asks only for email and when member will login then it asks for email and password.
11) When super admin adds the society, then it will should be ask for number of floors and number of wings. Then society admin will add resident so that system will show the number of floors and number of wings in options.
12) After adding the resident society admin can update basic details of the resident
13) Society admin adds the maintenance deadline then he/she should add payment reciever of Razorpay. So that when member pays the maintenace then it will send to the reciever of particular added by the society admin. Add actual payment of Razorpay (Test mode), I have already add API_KEY and API_SECRET of it in .env file.
14) In main admin panel, after adding the society it shows settings button in the card of particular society. But it is not working. So that add woking if required otherwise remove the button.
15) When super admin adds the society admins then it asks only for email not password, and when society admin will try to login then it asks for email and password both.
16) Solve all the bugs, errors and make it completely working.
17) Show original data in all the sections and pages from the database direclty. Don't show dummy data in any of the section if it is not required.
18) In all dashboards show original/real countings and real chart, real data for pendings like
In Member dashboard -> Maintenance Dues, Active Complaints, Notice Board, Registered Family & Vehicles
In Society Admin -> Total Residents, Maintenance Collected, Open Complaints, Approved Expenses
In Super Admin -> Active Societies, Total Registered Flats, Gross Platform Collections, Open Helpdesk Tickets
19) Display original/real Platform Financial & Operational Reports
in super admin's panel.
20) Remove panel for staff from the system. There is only 3 type of users -> Members of the society, Society admins (Chairman), Super admin (Handle all the society admins).
20) Make the system as real life system. So that every society can use the system for their society's operations.#   s o c i e t y - m a n a g e m e n t  
 