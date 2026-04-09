```markdown
# Inhouse Badminton System

A comprehensive, real-time tournament management and live-scoring platform designed for badminton organizations. This system enables administrators to manage tournaments and players, referees to score matches in real-time, and public viewers to follow live scoreboards and brackets.

## 🚀 Features

### Admin Dashboard
* **Tournament Management**: Create and manage tournaments with support for multiple formats including Single Elimination, Double Elimination, and Round Robin.
* **Player Registry**: Manage a central database of players including seeding, nationality, and coach assignments.
* **Match Assignment**: Assign referees to specific matches and manage court allocations.

### Referee Scoring Interface
* **Real-time Scoring**: Intuitive interface for referees to update points, sets, and match status instantly via WebSockets.
* **Rule Validation**: Built-in badminton scoring logic to handle server changes, set transitions, and match completion.
* **Match Timer**: Track active match duration for official records.

### Public Experience
* **Live Scoreboard**: Real-time updates for fans and spectators watching remotely.
* **Interactive Brackets**: Visual representation of tournament progress through dynamic bracket views.
* **Player Profiles**: View performance statistics and match history for individual players.

## 🛠️ Tech Stack

### Backend (`badminton-api`)
* **Node.js & Express**: Core API framework.
* **PostgreSQL & Sequelize**: Relational database for persistent storage.
* **Redis**: High-performance caching for live-score events.
* **Socket.IO**: Bi-directional real-time communication.
* **JWT & Bcrypt**: Secure authentication and password hashing.

### Frontend (`badminton-client`)
* **React**: Modern UI library for the single-page application.
* **Tailwind CSS**: Utility-first CSS framework for responsive design.
* **React Router**: Role-based routing and navigation.

## 📋 Prerequisites

* **Node.js** (v18+ recommended)
* **PostgreSQL**
* **Redis**

## 🔧 Installation & Setup

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `badminton_db`.

### 2. Backend Configuration
```bash
cd badminton-api
npm install
```
Create a `.env` file in the `badminton-api` directory using the provided variables in `badminton-api/.env.example`.

### 3. Frontend Configuration
```bash
cd badminton-client
npm install
```
Create a `.env` file in the `badminton-client` directory using the provided variables in `badminton-client/.env.example`.

## 🏃 Running the Application

### Start the Backend
```bash
cd badminton-api
npm run dev
```

### Start the Frontend
```bash
cd badminton-client
npm start
```
The application will be available at `http://localhost:3000`.

## 🏛️ Architecture Overview
The system follows a layered architecture:
* **Controllers/Routes**: Handle incoming HTTP requests and WebSocket events.
* **Services**: Contain business logic for scoring, analytics, and brackets.
* **Models**: Define the data structure for PostgreSQL.
* **Middlewares**: Manage authentication, roles, and error handling.

## 🔒 User Roles
* **Admin**: Full system access.
* **Referee**: Match scoring interface access.
* **Coach**: Player profile and analytics access.
* **Viewer**: Public access to scores and brackets.
```

### 2. Add Environment Examples
Since you shouldn't upload your actual `.env` files to GitHub, ensure these files exist in your folders so others know what to configure:

**`badminton-api/.env.example`**:
```text
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/badminton_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**`badminton-client/.env.example`**:
```text
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Essential `.gitignore`
Create a `.gitignore` file in the **root** directory to keep your repository clean:

```text
# Node dependencies
node_modules/

# Build folders
badminton-client/build/

# Environment files
.env
.env.local

# Logs
npm-debug.log*

# System files
.DS_Store
```
