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
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB_NAME=taskmanagerDB
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

The project is ready to deploy on Railway as a single Node service. Railway builds the Vite frontend into `frontend/dist`, then the Express backend serves both `/api/*` routes and the built React app.

### Required Railway Environment Variables

- `MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/`
- `MONGO_DB_NAME=taskmanagerDB`
- `REQUIRED_DB_NAME=taskmanagerDB`
- `JWT_SECRET=<long-random-secret>`
- `JWT_EXPIRES_IN=7d`
- `NODE_ENV=production`

Do not set `PORT` on Railway. Railway provides it automatically and the backend listens on `0.0.0.0:$PORT`.

Optional:

- `CLIENT_URL=<your-frontend-url>` only if the frontend is deployed as a separate service. For the default single-service deployment, leave it unset.

### Railway Deployment Steps

1. Push the project to GitHub.
2. In Railway, create a new project and deploy from the GitHub repository.
3. Keep the service root directory as `/` so Railway can see `railway.toml`, `package.json`, `backend`, and `frontend`.
4. Add the required environment variables above in the service `Variables` tab.
5. In MongoDB Atlas, allow Railway to connect. For a quick deployment, add `0.0.0.0/0` in Atlas Network Access. For production, replace that with a more restrictive network policy when available.
6. Deploy the Railway service.
7. After deployment, generate a Railway public domain for the service and open `/api/health` to confirm the backend is running.

Useful commands:

```bash
npm run build
npm start
```

In production, the backend can serve the built React frontend from `frontend/dist`.

## Notes

- Admin users can manage projects, members, and tasks.
- Member users can view their assigned work and update task status.
