# Student Expense Tracker - Expensio

A full-stack web application designed for college students to track personal expenses, split group bills, and simulate UPI payments.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS v4, Vite, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

## Prerequisites
1. **Node.js**: Make sure you have Node.js installed (v18+ recommended).
2. **MongoDB**: You need a running instance of MongoDB on your local machine, running on the default port `27017`.

## Getting Started

### 1. Database Setup
Ensure your local MongoDB server is running. The backend is configured to connect to `mongodb://localhost:27017/expensio`.

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm run dev
# or
node index.js
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will usually be available at `http://localhost:5173`.

## Features
- **User Authentication**: Secure signup and login.
- **Personal Expenses**: Track your solo expenses with categories.
- **Group Splitting**: Create groups with friends, add shared expenses, and split them equally or unequally.
- **Settlements & Balances**: See exactly who owes you and whom you owe.
- **UPI Deep Link**: Click "Pay via UPI" to simulate opening a UPI app to settle balances.
