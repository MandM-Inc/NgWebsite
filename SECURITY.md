# Security Policy

## Overview

This document outlines the security considerations and best practices for the NeuroGeneration website.

## Environment Variables

### Required Environment Variables

The following environment variables MUST be set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password_here
```

### Security Requirements

1. **Never commit `.env.local` to version control**
   - The `.gitignore` file is configured to exclude all `.env*` files
   - Always verify before committing that no environment files are included

2. **Use strong passwords**
   - `NEXT_PUBLIC_ADMIN_PASSWORD` should be:
     - At least 20 characters long
     - Include uppercase and lowercase letters
     - Include numbers and special characters
     - Generated using a password manager
   - Example: `NG_s3Cur3_P@ssw0rd_2024!_Ch@ng3_M3`

3. **Rotate credentials regularly**
   - Change your admin password periodically
   - Update Supabase keys if compromised
   - Keep credentials in a secure password manager

## Authentication System

### Current Implementation (Client-Side Demo)

⚠️ **WARNING**: The current authentication system is CLIENT-SIDE ONLY and suitable for demos/development environments, NOT production.

**Limitations:**
- Password stored in browser localStorage (base64 encoded, not hashed)
- No server-side validation
- Vulnerable to browser-based attacks
- Session management via localStorage/sessionStorage

### Production Recommendations

For production deployments, you MUST implement proper authentication:

1. **Use Supabase Auth**
   - Implement server-side authentication with Supabase Auth
   - Use JWT-based role validation
   - Enable Row Level Security (RLS) policies
   - See: https://supabase.com/docs/guides/auth

2. **Password Security**
   - Use proper password hashing (bcrypt, argon2)
   - Implement rate limiting on login attempts
   - Add 2FA/MFA for admin accounts
   - Never store passwords in plaintext or weak encoding

3. **Session Management**
   - Use HTTP-only cookies for session tokens
   - Implement secure session timeout
   - Add CSRF protection
   - Use secure token rotation

## Database Security

### Row Level Security (RLS)

The database schema includes RLS policies. For production:

1. **Remove development policies:**
   ```sql
   DROP POLICY IF EXISTS "Allow all operations on posts" ON posts;
   DROP POLICY IF EXISTS "Allow all operations on events" ON events;
   DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
   ```

2. **Keep production policies:**
   - Public read access for published content
   - Public comment creation with moderation
   - Admin-only write access (requires proper auth implementation)

3. **Implement JWT-based policies:**
   - Verify user roles from JWT tokens
   - Restrict admin operations to authenticated admins
   - See `supabase/schema.sql` for examples

### API Security

- Supabase anon key is safe for client-side use
- RLS policies protect data access
- Never expose service role keys in client code
- Monitor Supabase logs for suspicious activity

## Deployment Security

### Before Going Public

✅ **Checklist before making repository public:**

- [ ] All `.env*` files are in `.gitignore`
- [ ] No hardcoded passwords in source code
- [ ] No API keys or secrets committed to git
- [ ] Strong admin password set in environment variables
- [ ] Database RLS policies reviewed and hardened
- [ ] Security documentation updated
- [ ] Dependencies audited for vulnerabilities (`yarn audit`)

### Production Deployment

1. **Environment Variables**
   - Set all environment variables in your hosting platform
   - Use platform-specific secrets management (Vercel, Netlify, etc.)
   - Never commit production credentials

2. **HTTPS Only**
   - Ensure all traffic uses HTTPS
   - Configure HSTS headers
   - Use secure cookie flags

3. **Content Security Policy**
   - Implement CSP headers
   - Restrict inline scripts
   - Whitelist trusted domains

4. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Protect login endpoints from brute force
   - Monitor for abuse patterns

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly (contact information in README)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work on a fix promptly.

## Security Audit History

- **2024-10**: Initial security review and hardening
  - Removed hardcoded passwords
  - Added environment variable system
  - Created security documentation
  - Updated authentication warnings

## Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

## License

This security policy is part of the NeuroGeneration website project and follows the same MIT License.
