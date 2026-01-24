# Gossip on the Go

A Reddit-style web forum built for the CVWO Assignment AY2025/26.
Features a modular Go backend (Standard Library + Postgres) and a React/TypeScript frontend (MUI).

---

## AI Usage Declaration 

**AI Tool Used:** Google Gemini (Large Language Model)

**Purpose of Usage:**
I used Gemini primarily as a **tutor and technical guide** throughout the development process.
* **Concept Explanation:** Used to understand the flow of data between React and Go, and how `sql.DB` connections persist.
* **Debugging:** Used to resolve CORS errors, TypeScript type mismatches, and specific Go package visibility issues.
* **Boilerplate Generation:** Used to generate the initial Material UI (MUI) styling structures and repetitive SQL scan statements, which I then customized to fit my specific data models.

**Verification:**
I have reviewed all AI-suggested code to ensure it meets the assignment requirements (e.g., proper modularization of handlers, correct SQL injection protection) and accurately reflects my application logic.

---

## 📜 Development History (Proof of Work)

This repository is a **monorepo merge** of my separate development repositories. 
The complete commit history (showing work done over the assignment period) can be viewed here:

* **Original Backend Repository:** https://github.com/Henry336/forum-backend
* **Original Frontend Repository:** https://github.com/Henry336/forum-frontend

---

## How to Run

### Prerequisites

* Go 1.23+
* Node.js & npm
* PostgreSQL

### 1. Database Setup

**1. Open your terminal and log in to Postgres:**

```bash
psql -U postgres
```

**2. Create the database:**

```sql
CREATE DATABASE cvwo_forum;
\c cvwo_forum
```

**3. Run the following SQL commands to set up the schema:**

```sql
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY
);

CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    username VARCHAR(50) REFERENCES users(username),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    username VARCHAR(50) REFERENCES users(username),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**4. Populate initial topics:**

```sql
INSERT INTO topics (name) VALUES 
    ('General'), 
    ('NUS'), 
    ('Computing'), 
    ('Engineering');
```

### 2. Backend Setup

1. Create a `.env` file in the `backend` root directory with the following content:

   ```env
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/cvwo_forum?sslmode=disable
   ```

   (Note: Replace your_password with your actual local PostgreSQL password)

2. Run the server:

   ```bash
   cd backend
   go mod tidy
   go run main.go
   # Server starts on http://localhost:8080
   ```

### 3. Frontend Setup

From the root folder:

```bash
cd frontend
npm install
npm run dev
# Application runs on http://localhost:5173
```

---

## Features

* Create and browse posts by topic
* Comment on posts
* User authentication (username-based)
* Clean Material UI interface

---

## Tech Stack

**Backend:** Go (standard library), PostgreSQL  
**Frontend:** React, TypeScript, Material UI (MUI)