SmartFinance

SmartFinance is a simple and intuitive personal finance management app that helps users track expenses, manage budgets, and split shared costs with groups.

Features

User authentication (JWT)
Add, edit, delete personal expenses
Budget tracking & category-wise analytics
Group expense splitting
Clean and responsive UI
Dashboard with spending insights

Tech Stack

Frontend: React, TypeScript, TailwindCSS, React Query
Backend: Node.js, Express, TypeScript, MongoDB
Security: JWT, bcrypt
Validation: Zod

Getting Started

Install
git clone <repo-url>
cd smartfinance

Install dependencies:

cd backend && npm install
cd ../frontend && npm install

Environment Variables

Backend .env example:
PORT=4000
MONGO_URI=<your-mongo-uri>
JWT_SECRET=<secret>

Frontend .env example:
VITE_API_URL=http://localhost:4000/api

Run

Backend:
npm run dev

Frontend:
npm run dev


API Overview

POST /auth/register, /auth/login
GET/POST /expenses
GET /dashboard/summary
POST /groups → create group
POST /groups/:id/expenses → add group expense


Future Enhancements

Receipt OCR
AI budgeting recommendations
Mobile app version
