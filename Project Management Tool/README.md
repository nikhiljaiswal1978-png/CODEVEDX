# Project Management Tool — MERN + Vite

A full-stack project management application built with MongoDB, Express, React, Node.js and Socket.IO.

## Features

- JWT authentication with Admin / Manager / Employee roles
- Projects CRUD with members, dates, status and progress
- Tasks CRUD with assignment, status, priority, dates and progress
- Dashboard with live task/project statistics and Recharts
- Project Kanban board with drag-and-drop status changes
- Calendar and Gantt views
- Task comments and project activity logs
- Project/task file uploads
- Real-time project chat and task updates with Socket.IO
- Global analytics and project-level status/workload analytics
- Dark/light theme

## 🛠️ Technologies Used

### Frontend
- **React.js** – Building the user interface and application components
- **Vite** – Fast frontend development and build tool
- **JavaScript (ES6+)** – Application logic
- **React Router DOM** – Client-side routing and navigation
- **Axios** – Communication with backend REST APIs
- **Recharts** – Dashboard charts and analytics
- **React Big Calendar** – Calendar and task scheduling
- **Framer Motion** – UI animations and transitions
- **Lucide React** – Icons
- **date-fns** – Date formatting and manipulation
- **CSS** – Styling and responsive layouts

### Backend
- **Node.js** – Backend runtime environment
- **Express.js** – REST API and server framework
- **MongoDB** – Database for storing application data
- **Mongoose** – MongoDB object modeling
- **JWT (JSON Web Token)** – User authentication and authorization
- **Socket.IO** – Real-time communication and live updates
- **Multer** – File upload handling
- **CORS** – Cross-origin resource sharing
- **Morgan** – HTTP request logging

### Development Tools
- **npm** – Package management
- **Git & GitHub** – Version control and project hosting
- **VS Code** – Development environment

## 🏗️ Architecture

```text
                    Project Management Tool
                              │
             ┌────────────────┴────────────────┐
             │                                 │
         Frontend                           Backend
             │                                 │
      React.js + Vite                    Node.js + Express
             │                                 │
      React Router                         REST APIs
      Axios                                JWT Auth
      Recharts                            Socket.IO
      Calendar                             Multer
             │                                 │
             └────────────────┬────────────────┘
                              │
                       MongoDB + Mongoose
```
## Run locally

### 1. MongoDB

Start MongoDB locally, or set `MONGO_URI` in `backend/.env`.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Backend: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

The Vite dev server proxies `/api` and `/socket.io` to the backend.

## Environment

Copy `backend/.env.example` to `backend/.env` and set a strong `JWT_SECRET` for non-local use.

## Roles

The first registered account is automatically an **admin**. Later registrations are **employees**. An administrator can promote users to manager/admin from the Users page.

## Important

- Keep `frontend/node_modules` and `backend/node_modules` out of source-control/ZIP distributions.
- Uploaded files are stored locally in `backend/uploads`.
- For production, use a strong secret, HTTPS, persistent file storage and stricter upload validation.
