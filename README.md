# P&PVET - Veterinary Clinic Management System

Simple, local veterinary clinic management application. No login, no setup wizard - just works.

## Features

- Client management
- Animal records with medical history
- Appointments
- Medical visits and records
- Billing and payments
- Inventory with stock tracking
- Dashboard with real statistics
- Backup functionality

## Tech Stack

- React + TypeScript + Vite
- Express.js + SQLite (better-sqlite3)
- Tailwind CSS

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```

This starts both the backend (http://localhost:3001) and frontend (http://localhost:5173).

## Database

Data is stored in `data/ppvet.db`. The database is created automatically on first run.

## Backup

Use Settings > Download Backup or copy the `data/ppvet.db` file.

## Notes

- Uses Algerian Dinar (DZD)
- All data persists locally
- No internet connection required
- Works offline
