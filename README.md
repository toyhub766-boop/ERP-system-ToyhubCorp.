# Toy Hub ERP System

An internal ERP (Enterprise Resource Planning) and Inventory Management System developed for **Toy Hub Corporation** to manage inventory, production, users, and business operations from a centralized platform.

> This project is intended for internal company use and is not a public-facing application.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

## Project Structure

```
toys-hub-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
└── README.md
```

---

## Features

### Module 1 — Authentication & User Management

- JWT Authentication
- Secure Login
- Role-Based Access Control
- Protected Routes
- User CRUD

---

### Module 2 — Inventory Management (In Progress)

- Product Management
- Category Management
- Warehouse Management
- Inventory Transactions
- Search & Filtering

---

## User Roles

- Founder / Admin
- Inventory Staff
- Production Staff
- CRM Staff
- Accountant

Each role has access only to the modules required for their work.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/toyhub766-boop/ERP-system-ToyhubCorp.git
```

---

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Run:

```bash
npm run dev
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Current Development Status

| Module | Status |
|---------|--------|
| Authentication | ✅ Completed |
| User Management | ✅ Completed |
| Inventory | 🚧 In Progress |
| BOM | ⏳ Planned |
| Production | ⏳ Planned |
| Dispatch | ⏳ Planned |
| CRM | ⏳ Planned |
| Attendance | ⏳ Planned |
| Reports | ⏳ Planned |

---

## Development Philosophy

This project prioritizes:

- Functional implementation
- Clean architecture
- Fast development
- CRUD-first workflow
- Modular structure

UI polishing and advanced enhancements will be completed after all core modules are functional.

---

## License

This project was developed for **Toy Hub Corporation** as an internal ERP system.