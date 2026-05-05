# Student Expense Tracker - Implementation Plan

This document outlines the proposed architecture, database schema, API routes, and frontend components for the "Student Expense Tracker" application. 

## User Review Required

> [!IMPORTANT]
> Please review the proposed directory structure, database schema, and technology stack. Once approved, I will begin initializing the frontend and backend applications, writing the code, and setting up the environment.

## Open Questions

> [!QUESTION]
> 1. Do you have a preferred port for the backend server (e.g., 5000) and frontend development server (e.g., 5173)?
> 2. For the database, would you like to use a local MongoDB instance (`mongodb://localhost:27017/expensio`) or do you plan to use MongoDB Atlas later?
> 3. Should we use Vite for the React frontend setup? It provides a faster and more modern development experience compared to Create React App.

## Proposed Changes

### High-Level Folder Structure

The project will be split into a `frontend` and a `backend` directory.

```
c:\Expensio
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── .env             # Environment variables
│   ├── index.js         # Entry point
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI components (Navbar, ExpenseCard, etc.)
    │   ├── pages/       # Route-level components (Dashboard, Login, GroupDetails)
    │   ├── context/     # React Context for state management (Auth, etc.)
    │   ├── services/    # Axios API calls
    │   ├── App.jsx
    │   ├── index.css    # Tailwind CSS
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

### Backend (Node.js + Express + MongoDB)

#### Database Schema (Mongoose Models)

1. **User Model**
   - `name` (String, required)
   - `email` (String, required, unique)
   - `password` (String, required)
   - `upi_id` (String)

2. **Group Model**
   - `group_name` (String, required)
   - `created_by` (ObjectId, ref: 'User')
   - `members` ([ObjectId], ref: 'User')

3. **Expense Model (Personal & Group)**
   - `description` (String, required)
   - `amount` (Number, required)
   - `category` (String, enum: ['Food', 'Travel', 'Hostel', 'Study', 'Entertainment', 'Other'])
   - `date` (Date, default: Date.now)
   - `paid_by` (ObjectId, ref: 'User')
   - `group_id` (ObjectId, ref: 'Group', null for personal)

4. **ExpenseSplit Model** (Tracks who owes what for group expenses)
   - `expense_id` (ObjectId, ref: 'Expense')
   - `user_id` (ObjectId, ref: 'User') // The user who owes money
   - `amount_owed` (Number)
   - `is_paid` (Boolean, default: false)

#### API Routes

- **Auth**
  - `POST /api/auth/register` - Create a new user
  - `POST /api/auth/login` - Authenticate user and return token

- **Expenses**
  - `POST /api/expenses` - Create a new expense (personal or group)
  - `GET /api/expenses` - Get personal expenses for the logged-in user
  - `GET /api/expenses/summary` - Get monthly and category-wise totals

- **Groups**
  - `POST /api/groups` - Create a group
  - `GET /api/groups` - Get all groups for the user
  - `GET /api/groups/:id` - Get group details and expenses

- **Settlements**
  - `GET /api/settlements/balances` - Get balances ("You owe", "You will receive")
  - `POST /api/settlements/pay` - Mark a specific split as paid

---

### Frontend (React + Tailwind CSS)

#### Key Pages

1. **Login/Signup Page**: User authentication forms.
2. **Dashboard**: 
   - Monthly total expenses
   - Category breakdown (using a library like `recharts` or `chart.js`)
   - Recent personal transactions
   - Pending balances summary
3. **Add Expense**: Form to log a new personal or group expense.
4. **Group List**: View all groups and create new ones.
5. **Group Details**: View specific group expenses, members, and settlement options.
6. **Settlement Screen**: View who owes whom, with a "Pay via UPI" button that triggers a `upi://pay` deep link.

#### Basic Styling (Tailwind)
- **Colors**: Vibrant, modern palette (e.g., Indigo primary, Slate backgrounds, Emerald for positive balances, Rose for negative balances).
- **Dark Mode**: Configured via Tailwind class strategy.
- **Glassmorphism**: Subtle translucent backgrounds for cards and overlays.

## Verification Plan

### Automated/Manual Verification
1. Verify backend server runs and connects to the local MongoDB instance.
2. Verify API endpoints via Postman or standard HTTP requests (Auth, CRUD operations).
3. Verify Vite frontend builds successfully and renders the Login page.
4. Manually test user registration, logging an expense, creating a group, adding an expense to the group, and checking the calculated balances.
5. Verify the generated UPI deep link is correctly formatted (`upi://pay?pa=...&pn=...&am=...`).
