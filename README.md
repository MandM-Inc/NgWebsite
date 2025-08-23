# NeuroGeneration Official Website

The official website for NeuroGeneration (NG), a teen-led organization focused on neuroscience and psychology education. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

## Features

- 📝 Educational posts with Markdown and LaTeX support
- 📅 Event management with date/time tracking
- 💬 Comments system for community engagement
- 🎨 Beautiful purple-themed design with dark/light mode
- 🔐 Admin login and settings (password change; demo only)
- 📊 Analytics tracking for posts and events (RPC-based click counts)
- 🎯 SEO optimized with responsive design
- ☁️ Supabase client initialized in-browser (avoids SSR/prerender issues)
- 🌐 Social media integration (RedNote/Xiaohongshu, WeChat, Instagram, Twitter)
- 🧠 Focus on neuroscience and psychology content
- 📱 Community database page (under construction)

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Content**: Markdown with LaTeX support (KaTeX)

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sibohuang123/NgWebsite.git
cd NgWebsite
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Follow the instructions in [DATABASE_SETUP.md](DATABASE_SETUP.md) (use `supabase/schema-clean.sql`; optional `supabase/demo-content.sql`)

5. Run the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the website.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── posts/       # Blog posts
│   ├── events/      # Event pages
│   ├── admin/       # Admin dashboard
│   └── community-database/  # Community resources (under construction)
├── components/       # Reusable React components
├── lib/             # Utilities and configurations
├── types/           # TypeScript type definitions
└── supabase/        # Database schema and demo data
```

## Routing

- `/` Home page
- `/posts` Posts listing
- `/posts/[id]` Post detail (comments + reading progress)
- `/events` Events listing and search (supports `@tag:` and `@content:` filters)
- `/admin` Admin login
- `/admin/dashboard` Admin dashboard (analytics + quick links)
- `/admin/settings` Admin settings (change password)
- `/community-database` Placeholder page (under construction)

## Admin Access

Access the admin panel at `/admin` with default password: `ng-admin-2024`.

Notes:
- Storage keys (demo only; see `src/lib/auth.tsx`):
  - `localStorage`: `isAdmin` = `"true"` after login; `adminPasswordHash` = base64-encoded password.
  - `sessionStorage`: `adminPassword` (plaintext; used by `/admin/settings` to verify current password).
- Default password fallback: if `adminPasswordHash` is missing or invalid, the app falls back to `ng-admin-2024`.
- Change the password at `/admin/settings`: verifies the current session password and updates both storages; then redirects to `/admin/dashboard`.
- Production: implement proper authentication (e.g., Supabase Auth) and drop the dev "Allow all operations" RLS policies in `supabase/schema-clean.sql` (see `DATABASE_SETUP.md`).

## Analytics & Click Tracking

- Click counts increment on detail pages via Supabase RPC:
  - Posts: `src/app/posts/[id]/page.tsx` calls `supabase.rpc('increment_click_count', { table_name: 'posts', item_id: id })` on load.
  - Events: `src/app/events/[id]/page.tsx` calls the same with `table_name: 'events'`.
- RPC definition: `increment_click_count` lives in `supabase/schema-clean.sql` (SECURITY DEFINER) and updates the `click_count` column.
- Admin dashboard aggregation: `src/app/admin/dashboard/page.tsx` sums `click_count` across `posts` and `events` for "Total Views" and surfaces popular posts by `click_count`.
- RLS note: dev schema includes permissive policies for convenience. For production, remove them and ensure policies permit reading counts and executing the RPC.

## Available Scripts

```bash
yarn dev        # Start development server
yarn build      # Build for production
yarn start      # Start production server
yarn lint       # Run ESLint
```

## Deployment

See `DEPLOYMENT.md` for options (Vercel, Netlify, VPS) and environment variable guidance.

## Data Model Highlights

- Posts: id, title, content, tag, published_date, is_draft, click_count, created_at, updated_at
- Events: id, title, content, tag, start_date, duration, end_date, is_draft, click_count, created_at, updated_at
- Comments: id, post_id OR event_id, author_name, content, created_at (mutually exclusive post/event reference)
- RLS: enabled; public read of non-draft posts/events, public comment insert. `schema-clean.sql` includes dev "allow all" policies—remove for production.

## Recent Updates

- Added psychology focus alongside neuroscience throughout the website
- Integrated social media logos for RedNote/Xiaohongshu, WeChat, Instagram, and Twitter
- Improved footer design with 3-column layout and quick links
- Added placeholder Community Database page (content coming soon)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.