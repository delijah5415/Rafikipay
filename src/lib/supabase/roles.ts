/**
 * Role helpers.
 *
 * A user's role is stored in Supabase `user_metadata.role`. Admins are
 * designated by an allowlist of emails (comma-separated `ADMIN_EMAILS`
 * env var) so that admin privileges can never be self-assigned through
 * the public signup form.
 */

export type Role = 'user' | 'admin';

/** Emails that should be provisioned/treated as admins. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the given email is on the admin allowlist. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Resolve the role for an email at signup/login time. */
export function roleForEmail(email: string | null | undefined): Role {
  return isAdminEmail(email) ? 'admin' : 'user';
}

/** Extract a role from a Supabase user's metadata, defaulting to 'user'. */
export function roleFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): Role {
  return metadata?.role === 'admin' ? 'admin' : 'user';
}
