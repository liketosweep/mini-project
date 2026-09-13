# Habit Arena

An accountability-driven habit tracking and private challenge room application built as a college mini-project.

## Features

- **Authentication**: Secure email and password authentication powered by Supabase Auth.
- **User Profiles**: Display name, unique username, and earned virtual points tally.
- **Solo Habits**: Create, edit, and archive personal habits with categories.
- **Daily Check-Ins**: Daily self-reported "DONE" check-in with optional reflection notes (max 1 check-in per habit per day).
- **Personal Streaks**: Track current streaks and longest streaks with automatic date continuity calculation.
- **Private Challenge Rooms**:
  - Private, invite-only rooms (zero public discovery).
  - Shareable invite links and acceptance deadline enforcement.
  - Unlimited virtual stake setting for competitive presentation.
  - 1 successful check-in = 1 leaderboard point.
  - Live leaderboard updated in real-time via Supabase Realtime.
  - Final locked standings upon room completion.
  - Tiered virtual points rewards credited to winners.
- **Personal Statistics**: Total completed check-ins, overall completion rate, active streaks, and daily activity calendar.
- **Responsive Design**: Tailored for both desktop/laptop browsers and Android mobile devices.

## Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Realtime, Row Level Security)
- **Validation & Forms**: Zod + React Hook Form
- **Icons & Dates**: Lucide React + date-fns

## Getting Started

1. **Install dependencies**:
   `ash
   npm install
   `

2. **Configure environment variables**:
   Create a .env.local file with your Supabase credentials:
   `env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   `

3. **Run development server**:
   `ash
   npm run dev
   `

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
