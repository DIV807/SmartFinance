# SmartFinance

SmartFinance is a **simple and intuitive personal finance management app** that helps users **track expenses**, **manage budgets**, and **split shared costs within groups**, all through a clean and responsive dashboard.

---

## Features

* **User Authentication**

  * Secure login and registration using JWT
* **Expense Management**

  * Add, edit, and delete personal expenses
* **Budget Tracking and Analytics**

  * Category-wise spending insights
* **Group Expense Splitting**

  * Create groups and track shared expenses
* **Dashboard**

  * Visual overview of spending patterns
* **Clean and Responsive UI**

  * Optimized for desktop and mobile devices

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* React Query

### Backend

* Node.js
* Express
* TypeScript
* MongoDB

### Security and Validation

* JWT (JSON Web Tokens)
* bcrypt (password hashing)
* Zod (schema validation)

---

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd smartfinance
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## Environment Variables

### Backend (`.env`)

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

---

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

### Start Frontend Server

```bash
cd frontend
npm run dev
```

The application will be available at:

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:4000`

---

## API Overview

### Authentication

* `POST /auth/register` – Register a new user
* `POST /auth/login` – Login user

### Expenses

* `GET /expenses` – Fetch expenses
* `POST /expenses` – Add expense

### Dashboard

* `GET /dashboard/summary` – Get spending summary

### Groups

* `POST /groups` – Create a group
* `POST /groups/:id/expenses` – Add a group expense

---

## Future Enhancements

* Receipt OCR for automatic expense entry
* AI-powered budgeting recommendations
* Mobile application (Android and iOS)

---

## Contributing

Contributions, issues, and feature requests are welcome.
Feel free to fork the repository and submit a pull request.

---

## Support

If you find this project useful, consider starring the repository on GitHub.

---

**Built to simplify personal finance management.**
