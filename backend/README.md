# Backend (Node.js + TypeScript + Prisma + JWT)

## Overview

This backend provides user authentication (JWT access + refresh tokens), task management with full CRUD, pagination, search, filtering, and secure ORM-based database operations using **Prisma**.

---

## Features

- **Authentication**

  - Register, Login, Logout
  - Access Token + Refresh Token (httpOnly cookie)
  - Bcrypt password hashing

- **Task Management**

  - Create, Read, Update, Delete tasks
  - Toggle task status
  - Pagination, Search, Filtering

- 🗄️ **Database**

  - Prisma ORM
  - SQL Database (SQLite/Postgres)

- ⚙️ **Tech Stack**
  - Node.js
  - TypeScript
  - Express.js
  - Prisma ORM
  - Zod Validation

---

## API Routes

### Auth Routes

```
/auth/register
/auth/login
/auth/refresh
/auth/logout
```

### Task Routes

```
/tasks (GET, POST)
/tasks/:id (GET, PATCH, DELETE)
/tasks/:id/toggle (POST)
```

---

## 📸 API Routes Screenshot

### Route: POST /auth/login

![Login Route Screenshot](./assets/screenshots/login_user.png)

### Route: POST /auth/register

![Register Route Screenshot](./assets/screenshots/register_user.png)

### Route: POST /auth/refresh

![Refresh Token Route Screenshot](./assets/screenshots/refresh_user.png)

### Route: POST /auth/logout

![Logout Route Screenshot](./assets/screenshots/logout_user.png)

### Route: GET /tasks

![Get All Tasks Route Screenshot](./assets/screenshots/get_all_tasks.png)

### Route: GET /tasks/:id

![Get Current Task Route Screenshot](./assets/screenshots/get_current_task.png)

### Route: POST /tasks

![Create Task Route Screenshot](./assets/screenshots/add_task.png)

### Route: PATCH /tasks/:id

![Modify Task Route Screenshot](./assets/screenshots/update_task.png)

### Route: DELETE /tasks/:id

![Delete Task Route Screenshot](./assets/screenshots/delete_task.png)

### Route: POST /tasks/:id/toggle

![Toggle Task Status Route Screenshot](./assets/screenshots/toggle_Status.png)

---

## Setup & Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env`:

```
DATABASE_URL="file:./dev.db"
ACCESS_TOKEN_SECRET="your_secret"
REFRESH_TOKEN_SECRET="your_refresh_secret"
ACCESS_TOKEN_EXPIRES_IN="your_access_expire"
REFRESH_TOKEN_EXPIRES_IN="your_refresh_expire"
PORT="port_number"
NODE_ENV="production || development"
FRONTEND_URL=http://localhost:3000
```

### 3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
```

### 4. Run the Server

```bash
npm run dev
```

---

## Project Structure

```
src/
 ├─ routes/
 ├─ controllers/
 ├─ middlewares/
 ├─ validators/
 ├─ utils/
 ├─ prismaClient.ts
 └─ app.ts
```

---

## Notes

- Refresh token is stored **server-side** to prevent token reuse.
- Access token stored **in-memory on frontend** for security.
- CORS configured for secure cookie handling.

---

## License

MIT
