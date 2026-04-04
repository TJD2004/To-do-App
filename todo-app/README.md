# To-Do List API

A RESTful Task Management API built with **Node.js**, **Express**, and **MongoDB (Mongoose)**. Supports full CRUD operations, filtering, due dates, categories, and a complete test suite.

---

## Features

- Create, read, update, and delete tasks
- Mark tasks as complete (with duplicate-complete guard)
- Filter tasks by completion status or category
- Sort tasks by due date or creation date
- Due date tracking with `isOverdue` virtual field
- Six task categories: `personal`, `work`, `shopping`, `health`, `finance`, `other`
- Input validation with meaningful error messages
- Global error handling (Mongoose errors, invalid IDs, 404s)
- 30+ unit and integration tests using Jest + Supertest

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18.x |
| npm | >= 9.x |
| MongoDB | >= 6.x (local) **or** MongoDB Atlas URI |

---

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
cd todo-app
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and set your MONGODB_URI

# 3. Start the server
npm run dev         # development (auto-restart with nodemon)
npm start           # production
```

The server starts at **http://localhost:3000** by default.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment (`development` / `test` / `production`) |
| `MONGODB_URI` | `mongodb://localhost:27017/todo-app` | MongoDB connection string |

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

---

### Tasks

#### List all tasks
```
GET /api/tasks
```

**Query parameters:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `completed` | boolean | `?completed=false` | Filter by completion status |
| `category` | string | `?category=work` | Filter by category |
| `sort` | string | `?sort=dueDate` | Sort: `dueDate`, `-dueDate`, `title`, `-createdAt` |

**Response 200:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "tasks": [...],
    "total": 3
  }
}
```

---

#### Get a single task
```
GET /api/tasks/:id
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "task": {
      "_id": "665f...",
      "title": "Write tests",
      "description": "Add Jest coverage",
      "completed": false,
      "category": "work",
      "dueDate": "2025-06-30T00:00:00.000Z",
      "isOverdue": false,
      "createdAt": "2025-06-01T10:00:00.000Z",
      "updatedAt": "2025-06-01T10:00:00.000Z"
    }
  }
}
```

---

#### Create a task
```
POST /api/tasks
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Write tests",
  "description": "Add Jest coverage",
  "dueDate": "2025-06-30",
  "category": "work"
}
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `title` | ✅ | string | 1–200 chars |
| `description` | ❌ | string | max 1000 chars |
| `dueDate` | ❌ | ISO 8601 date | e.g. `2025-12-31` |
| `category` | ❌ | string | `personal` `work` `shopping` `health` `finance` `other` |

**Response 201:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { "task": { ... } }
}
```

---

#### Update a task
```
PATCH /api/tasks/:id
Content-Type: application/json
```

All fields are optional. Only provided fields are updated.

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "dueDate": "2025-07-15",
  "category": "personal"
}
```

> **Note:** Sending `completed: true` on an already-completed task returns `400 Bad Request`.

**Response 200:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { "task": { ... } }
}
```

---

#### Mark task as complete (convenience endpoint)
```
PATCH /api/tasks/:id/complete
```
No body required. Returns `400` if task is already complete.

---

#### Delete a task
```
DELETE /api/tasks/:id
```

**Response 200:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": { "id": "665f..." }
}
```

---

### Error Response Format

All errors follow a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

| Status | Meaning |
|--------|---------|
| `400` | Validation error / bad input |
| `404` | Task not found |
| `500` | Internal server error |

---

## Running Tests

```bash
npm test                # run all tests
npm run test:coverage   # run with coverage report
```

Tests use **mongodb-memory-server** — no real MongoDB instance needed.

```
 PASS  tests/task.test.js
  POST /api/tasks
    ✓ creates a task with title and description
    ✓ returns 400 when title is missing
    ✓ creates a task with a due date
    ✓ creates a task with a category
    ...
  GET /api/tasks
  GET /api/tasks/:id
  PATCH /api/tasks/:id
  PATCH /api/tasks/:id/complete
  DELETE /api/tasks/:id
  Unknown routes

Test Suites: 1 passed
Tests:       30 passed
```

---

## Project Structure

```
todo-app/
├── src/
│   ├── app.js                   # Express app + server bootstrap
│   ├── config/
│   │   └── database.js          # Mongoose connection
│   ├── models/
│   │   └── Task.js              # Task schema & model
│   ├── controllers/
│   │   └── taskController.js    # Route handlers (business logic)
│   ├── routes/
│   │   └── taskRoutes.js        # Express Router definitions
│   └── middleware/
│       ├── validate.js          # express-validator rules
│       └── errorHandler.js      # Global error & 404 handlers
├── .env.example
├── package.json
└── README.md
```

---

## Key Design Decisions

### Layered architecture
Controllers handle HTTP concerns (parsing body, sending response). Business rules live in controllers but the model owns schema validation — Mongoose's `ValidationError` is caught by the global error handler so controllers stay clean.

### PATCH over PUT
`PATCH` is used for updates because it supports partial updates (only provided fields change). `PUT` would require the full object every time.

### Duplicate-complete guard
The API explicitly rejects marking an already-complete task as complete again. This is enforced at the controller layer so the error message is user-friendly, not a silent no-op.

### Global error handler
All `async` route handlers pass errors to `next(err)`. The central `errorHandler` middleware normalises Mongoose errors (`ValidationError`, `CastError`, duplicate key) into the standard JSON shape, keeping controllers free of try/catch repetition boilerplate.

### mongodb-memory-server for tests
Tests spin up a real in-memory MongoDB instance — no mocking, no external dependency. This means tests verify actual Mongoose behaviour (indexes, validators, virtuals) while remaining isolated and fast.

---

## License

MIT
