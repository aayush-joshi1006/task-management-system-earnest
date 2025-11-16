
# Frontend (Next.js + TypeScript + React Query + Axios + JWT Auth)

## Overview
This frontend is a modern Next.js App Router application using **React Query**, **Axios**, **React Hook Form**, **Zod**, and secure token refresh flows.

---

## Features
- **Authentication**
  - Login / Register
  - Auto-refresh access tokens
  - In-memory access token storage
  - httpOnly refresh cookie

- **Task Dashboard**
  - View tasks with pagination
  - Search & filter tasks
  - Create / Toggle / Delete tasks
  - Optimistic updates with React Query
  - Toast notifications

- **Tech Stack**
  - Next.js App Router
  - TypeScript
  - React Query
  - React Hook Form + Zod
  - Tailwind CSS
  - Axios (auto-refresh client)

---

## Pages View Screenshot  
(Add screenshot here)

---

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run the development server
```bash
npm run dev
```

---

## Project Structure
```
app/
 ├─ login/
 ├─ register/
 ├─ layout.tsx
 └─ page.tsx

components/
 ├─ AuthProvider.tsx
 ├─ TaskList.tsx
 ├─ TaskForm.tsx
 └─ useAuth.tsx

lib/
 └─api.ts
 
```

---

## Notes
- Fully modern stack with best practices.
- Uses optimistic UI updates for responsiveness.
- Secure token handling: never stores JWT in localStorage.

---

## License
MIT
