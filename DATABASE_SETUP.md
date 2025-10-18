# Database Setup Guide

This guide will help you set up the database tables in Supabase for the NeuroGeneration website.

## Quick Setup

1. **Login to Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign in to your account
   - Select your project

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New query"

3. **Run Schema Script**
   - Copy the entire contents of `supabase/schema-clean.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - You should see "Success. No rows returned"
   
   **Note**: Use `schema-clean.sql` instead of `schema.sql` to avoid compatibility issues.

4. **Add Demo Content (Optional)**
   - Create a new query (click "+ New query")
   - Copy the entire contents of `supabase/demo-content.sql`
   - Paste it into the SQL editor
   - Click "Run"
   - You should see "Success. 2 rows affected" (or similar)

## Verify Installation

To verify the tables were created correctly:

1. Go to "Table Editor" in the left sidebar
2. You should see these tables:
   - `posts`
   - `events`
   - `comments`

## Important Notes

- **Use `schema-clean.sql`** - This is the corrected version that works with Supabase
- The script will drop existing tables before creating new ones
- This ensures a clean setup without conflicts

## Step-by-Step Instructions

### For First Time Setup:

1. **Copy the schema-clean.sql content**
2. **In Supabase SQL Editor:**
   ```sql
   -- Paste the entire content of schema-clean.sql here
   ```
3. **Click "Run"**
4. **Then copy demo-content.sql content**
5. **In a new query:**
   ```sql
   -- Paste the entire content of demo-content.sql here
   ```
6. **Click "Run"**

## Troubleshooting

### "generation expression is not immutable" error
This error occurs with the old schema.sql. Use schema-clean.sql instead.

### "relation already exists" error
This means the tables are already created. You can:
- Skip this step, or
- Drop existing tables first (WARNING: This will delete all data):
  ```sql
  DROP TABLE IF EXISTS comments CASCADE;
  DROP TABLE IF EXISTS posts CASCADE;
  DROP TABLE IF EXISTS events CASCADE;
  ```

### "permission denied" error
Make sure you're using the correct project and have admin rights.

### RLS (Row Level Security) Issues
The schema automatically enables RLS. If you're having permission issues:
1. Go to Authentication > Policies
2. Check that the policies are enabled
3. For testing, you can temporarily disable RLS (not recommended for production):
   ```sql
   ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE events DISABLE ROW LEVEL SECURITY;
   ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
   ```

## What the Schema Creates

### Tables
1. **posts** - Blog posts with markdown content
2. **events** - Events with start/end times
3. **comments** - Comments on posts and events

### Features
- UUID primary keys
- Automatic timestamps
- Click counting
- Draft/published states
- Row Level Security policies
- Indexes for performance

## Production Hardening (remove dev policies)

The `supabase/schema-clean.sql` includes permissive "Allow all operations" policies for development:
- `Allow all operations on posts` (posts)
- `Allow all operations on events` (events)
- `Allow all operations on comments` (comments)

For production, drop these policies and keep RLS enabled:
```sql
DROP POLICY IF EXISTS "Allow all operations on posts" ON posts;
DROP POLICY IF EXISTS "Allow all operations on events" ON events;
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
```

This leaves only:
- Public read of non-draft posts and events
- Public read of comments
- Public create of comments

If you implement Supabase Auth and JWT-based roles, see `supabase/schema.sql` for example "admin" policies using `auth.jwt() ->> 'role' = 'admin'`. Do not enable those until your app issues JWTs containing that claim.

## Next Steps

After setting up the database:
1. Refresh your website
2. Navigate to `/posts` or `/events`
3. If using demo content, you should see 2 posts and 2 events
4. Try the admin panel at `/admin` (use the password you set in your `.env.local` file under `NEXT_PUBLIC_ADMIN_PASSWORD`)

**Security Note**: Make sure you've set a strong password in your `.env.local` file. Never use the default example password in production!

## Need Help?

If you encounter issues:
1. Check the Supabase logs (Settings > Logs)
2. Verify your environment variables are correct
3. Ensure your Supabase project is active (not paused)
