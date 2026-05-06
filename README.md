# Team Task Manager

Team Task Manager is a MERN stack project built for managing projects and tasks in a small team. It includes login/signup, role-based access, project management, task assignment, dashboard stats, and a simple Kanban-style task board.


## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT
- Other tools: Axios, React Router, Lucide Icons

## Features

- User signup and login
- Admin and Member roles
- Dashboard with task and project stats
- Create and manage projects
- Add or remove project members
- Create, assign, update, and delete tasks
- Update task status using a Kanban-style board
- Search and filter tasks
- Responsive UI for desktop and mobile
- Mock email log when a task is assigned

## Folder Structure

```txt
team-task-manager/
├── backend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
npm run install:all
```

### 3. Create environment files

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/taskmanagerDB
REQUIRED_DB_NAME=taskmanagerDB
JWT_SECRET=replace_with_a_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the project

```bash
npm run dev
```

Frontend:

```txt
http://localhost:5173
```

Backend:

```txt
http://localhost:5000
```

## API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:memberId`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

### Dashboard

- `GET /api/dashboard`

## Deployment

The project is ready to deploy on platforms like Railway.

### Required Railway Environment Variables

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

Basic deployment steps:

- Push the project to GitHub
- Create a new Railway project from the repository
- Add backend environment variables in Railway
- Build the frontend
- Start the backend server

Useful commands:

```bash
npm run build
npm start
```

In production, the backend can serve the built React frontend from `frontend/dist`.

## Notes

- Admin users can manage projects, members, and tasks.
- Member users can view their assigned work and update task status.
