# ShuttleScore — Backend API

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Start PostgreSQL and Redis (Docker example)
docker run -d --name pg    -e POSTGRES_DB=badminton_db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
docker run -d --name redis -p 6379:6379 redis:7

# 4. Start dev server (auto-syncs DB schema)
npm run dev
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Any | Get current user |
| GET | /api/players | Any | List all players |
| POST | /api/players | Admin | Create player |
| GET | /api/tournaments | Any | List tournaments |
| POST | /api/tournaments | Admin | Create tournament |
| POST | /api/tournaments/:id/generate-bracket | Admin | Generate bracket |
| GET | /api/tournaments/:id/bracket | Any | Get bracket |
| GET | /api/matches | Any | List matches |
| GET | /api/matches/:id/live-score | Public | Get live score |
| POST | /api/scorecards/:matchId/generate | Admin/Referee | Generate PDF |
| GET | /api/analytics/player/:id | Any | Player stats |

## Socket Events (Referee namespace `/referee`)

| Event (emit) | Payload | Description |
|---|---|---|
| join_match | matchId | Join a match room |
| add_point | { matchId, scoredById, serverId } | Record a point |
| undo_point | { matchId } | Undo last point |

| Event (receive) | Description |
|---|---|
| score_update | Current set scores |
| match_ended | Final match result |

## Socket Events (Public namespace `/public`)

| Event (emit) | Payload | Description |
|---|---|---|
| watch_match | matchId | Subscribe to match updates |
| watch_tournament | tournamentId | Subscribe to bracket updates |

| Event (receive) | Description |
|---|---|
| score_update | Live score changes |
| bracket_update | Bracket progression |
