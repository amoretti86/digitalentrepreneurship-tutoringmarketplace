# Digital Entrepreneurship Lab — Tutoring Marketplace

This project extends the simple registration app from Lab 3 into a two-sided tutoring marketplace built with React, Express, and Supabase.

Students and tutors can register, log in, create profiles, upload photos, and browse available tutors with filters by subject and hourly rate.

------------------------------------------------------------

## Overview

Frontend: React (Create React App), Axios
Backend: Express.js, Supabase SDK
Database and Auth: Supabase (PostgreSQL + Auth + Storage)
Storage: Supabase Storage for profile photos

------------------------------------------------------------

## Features

- Email registration and verification (Spelman and Morehouse domains)
- Login and logout using Supabase Auth
- Unified profiles table for both students and tutors
- Tutors can set hourly rate, subjects, and upload a photo
- Students can browse tutors and filter by subject and hourly rate
- Modular React components:
  - ProfileSetup.js for creating or updating profiles
  - TutorCard.js and TutorList.js for displaying tutors
  - Dashboard.js for switching between tabs
- Supabase Row-Level Security (RLS) for data protection

------------------------------------------------------------

## Database Setup (Supabase)

1. Create a "profiles" table in Supabase SQL Editor:
```
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('student','tutor')) not null,
  name text not null,
  school text,
  major text,
  grade text,
  hourly_rate numeric,
  subjects text[] default '{}',
  photo_url text,
  bio text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_hourly_rate on public.profiles(hourly_rate);
create index if not exists idx_profiles_subjects on public.profiles using gin (subjects);

alter table public.profiles enable row level security;
```
2. Add RLS policies:
```
create policy "read_tutors_public"
on public.profiles for select
to public using (role = 'tutor');

create policy "read_own_profile"
on public.profiles for select
to authenticated using (auth.uid() = id);

create policy "insert_own_profile"
on public.profiles for insert
to authenticated with check (auth.uid() = id);

create policy "update_own_profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```
3. Create a public storage bucket in Supabase → Storage → Buckets
   - Name: avatars
   - Public access: enabled

------------------------------------------------------------

## Environment Variables

Server (.env):
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=5000
```
Client (.env):
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```
------------------------------------------------------------

## Project Structure

digitalentrepreneurship-tutoringmarketplace/
```
├── server/
│   ├── server.js
│   └── .env
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── Dashboard.js
│   │   ├── ProfileSetup.js
│   │   ├── TutorCard.js
│   │   ├── TutorList.js
│   │   ├── supabaseClient.js
│   │   └── *.css
│   └── .env
├── package.json
└── README.md
```
------------------------------------------------------------

## How It Works

Authentication:
Handled by Supabase Auth. Users must register with a spelman.edu or morehouse.edu email address.
After verifying the email via 6-digit OTP, users are logged in automatically.

Profiles:
All users share the same "profiles" table and are distinguished by a "role" field.
Tutors include hourly rate, subjects, and bio.
Students have simpler profiles and can browse tutors.

API Endpoints:
```
POST /register - Register a new user
POST /login - Log in existing user
POST /verify - Verify email with 6-digit code
POST /api/profile - Create or update a profile
GET /api/profile/:id - Get a user's profile
GET /api/tutors - Get all tutor profiles, with optional filters (subject, maxRate)
```
------------------------------------------------------------

## React Components
```
App.js - Handles registration, login, and verification flow
Dashboard.js - Main view with "Find Tutors" and "My Profile" tabs
ProfileSetup.js - Form for creating or updating profile
TutorList.js - Lists tutors and allows filtering
TutorCard.js - Displays tutor photo, subjects, and hourly rate
supabaseClient.js - Frontend Supabase client for uploads
```
------------------------------------------------------------

## Running Locally

1. Install dependencies
```
npm install
cd client && npm install
```
2. Build frontend and start backend
```
npm run build --prefix client
node server/server.js
```
Server runs on http://localhost:5000

------------------------------------------------------------

## Workflow Summary

1. Register with a Spelman or Morehouse email
2. Enter 6-digit verification code
3. Dashboard loads with two tabs:
   - Find Tutors: browse tutors, filter by subject and hourly rate
   - My Profile: edit or update your profile and upload a photo
4. Tutors are visible publicly; students can browse and filter them.

------------------------------------------------------------

## Educational Notes

Students learn how to:

- Extend a single-user registration app into a two-sided marketplace
- Use Supabase Auth and RLS policies for secure data access
- Handle image uploads with Supabase Storage
- Implement filtering using query parameters
- Compose a React app from reusable components
- Connect React to an Express API using Axios

------------------------------------------------------------

## Future Extensions

- Messaging between students and tutors
- Appointment scheduling and payment integration
- Availability calendar for tutors
- Pagination and advanced search

------------------------------------------------------------

## License

MIT License © 2025 Antonio Moretti
