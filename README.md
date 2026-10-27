# P&PVET - Veterinary Clinic Management System

A production-ready veterinary clinic management application for a solo veterinarian in Algeria. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- **Authentication** - Secure username/password login with first-login password change
- **Client Management** - Create, view, edit clients and their animals
- **Animal Profiles** - Complete animal records with medical history
- **Appointments** - Schedule and manage appointments
- **Medical Records** - Clinical visits, diagnoses, treatments, prescriptions
- **Vaccinations** - Track vaccination history and due dates
- **Billing & Invoices** - Create invoices with line items, partial payments
- **Inventory** - Product management with stock tracking
- **Dashboard** - Real-time statistics from database
- **Settings** - Clinic configuration and password management

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Backend/DB**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React
- **Date**: date-fns

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone https://github.com/oussamasaidguerni-cyber/ppvet.git
cd ppvet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MEHDI_INITIAL_PASSWORD=your_secure_initial_password
```

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run migrations in order:
   - `supabase/migrations/20240101000000_complete_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql`
4. Go to Authentication > Users and create user:
   - Email: `mehdi@ppvet.local` (or configure username mapping)
   - Password: Use value from `MEHDI_INITIAL_PASSWORD`
5. Run `scripts/create-mehdi-user.sql` in SQL Editor

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Login

- Username: `mehdi`
- Password: Use the password set in Supabase Auth (from MEHDI_INITIAL_PASSWORD)
- On first login, you'll be prompted to change your password

## Important Notes

- All data is stored in Supabase PostgreSQL with Row Level Security
- No demo data is seeded - empty states guide you to create your first records
- Financial calculations use NUMERIC types for precision
- Stock updates are transactional
- All passwords are hashed by Supabase Auth
- Never commit real credentials

## License

Private - All rights reserved
