# EduSync-V2

<p align="center">
  A comprehensive educational management application built with Next.js and Supabase
</p>

<p align="center">
  <img alt="EduSync Logo" src="/public/images/logo-black.svg" width="120">
</p>

## Features

- **Student Dashboard**: View academic performance at a glance
- **Grade Management**: Track, add, and analyze your grades with detailed statistics
- **Semester Management**: Create and manage semesters with customizable default preferences
- **Calendar System**: Manage events and schedule with an intuitive calendar interface
- **Authentication**: Secure user authentication with Supabase Auth
- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme support to match your preference
- **User Preferences**: Customize display settings and default behaviors

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org) (App Router)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Backend & Auth**: [Supabase](https://supabase.com)
- **Data Visualization**: Recharts for grade statistics and trends

## Development

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase project (create one at [database.new](https://database.new))

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/YourUsername/EduSync-V2.git
   cd EduSync-V2/web
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_SUPABASE_PROJECT_API_ANON_KEY]
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Schema

The application uses the following primary tables in Supabase:

- **users** - User authentication and profile information
- **grades** - Student grade entries with subject, score, and date
- **calendar_events** - Calendar events with title, description, and date information

## Deployment

This project can be deployed with Vercel for optimal performance with Next.js:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2FEduSync-V2)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
