# P&PVET - Veterinary Clinic Management System

P&PVET is a professional, production-minded veterinary clinic management web application designed for a solo veterinarian in Algeria. Currently in Stage 1 of development, it provides core functionality for client and animal management with a secure, modern interface.

## Features Implemented (Stage 1)

- **Authentication** - Secure login/signup with Supabase Auth
- **Dashboard** - Overview with quick actions and onboarding for new clinics
- **Client Management** - Create, view, edit, and search clients
- **Animal Management** - Register animals under clients with detailed profiles
- **Clinic Settings** - Configure clinic information, currency (DZD), and timezone
- **Responsive Design** - Mobile and desktop optimized interface
- **Secure Architecture** - Row Level Security (RLS) with clinic-level data isolation
- **Modern UI** - Clean, minimalist monochrome design

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Backend/Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
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

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your URL and anon key
3. Go to Authentication > Settings and configure as needed
4. Run the migrations in the SQL Editor or using Supabase CLI

## Migration Instructions

The migrations are located in `supabase/migrations/`:

1. `20240101000000_initial_schema.sql` - Creates all tables, indexes, and triggers
2. `20240101000001_rls_policies.sql` - Enables RLS and creates security policies

You can run these in your Supabase project's SQL Editor in order, or use the Supabase CLI:

```bash
supabase db push
```

## Local Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Testing and Production Build

Type checking:
```bash
npm run build
```

Linting (if configured):
```bash
npm run lint
```

Preview production build:
```bash
npm run preview
```

## Deployment

This application can be deployed to:
- Vercel
- Netlify
- Any static hosting service that supports SPA routing

Make sure to set your environment variables in your deployment platform.

## Current Limitations (Stage 1)

- Appointments module is a placeholder
- Medical Records module is a placeholder
- Billing/Payments module is a placeholder
- Inventory module is a placeholder
- No data export functionality
- No multi-user roles/permissions beyond clinic owner
- No appointment reminders or notifications

## Next Development Stage

Future stages will implement:
- Appointment scheduling and management
- Medical records, visits, and consultations
- Prescriptions and treatments
- Vaccinations tracking
- Billing, invoices, and payments
- Inventory management with stock tracking
- Reports and analytics

## Security Notes

- All sensitive data is protected by Row Level Security
- Users can only access data from their own clinic
- Authentication is handled by Supabase Auth
- No service role keys are exposed in client code
- Input validation on both client and database levels
