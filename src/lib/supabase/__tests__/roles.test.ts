import { isAdminEmail, roleForEmail, roleFromMetadata } from '../roles';

describe('supabase roles', () => {
  const OLD_ENV = process.env.ADMIN_EMAILS;
  afterEach(() => {
    process.env.ADMIN_EMAILS = OLD_ENV;
  });

  describe('isAdminEmail', () => {
    it('matches allowlisted emails case-insensitively and trims spaces', () => {
      process.env.ADMIN_EMAILS = ' Admin@Rafiki.com , boss@rafiki.com ';
      expect(isAdminEmail('admin@rafiki.com')).toBe(true);
      expect(isAdminEmail('BOSS@rafiki.com')).toBe(true);
      expect(isAdminEmail('user@rafiki.com')).toBe(false);
    });
    it('is false when the allowlist is empty or email missing', () => {
      process.env.ADMIN_EMAILS = '';
      expect(isAdminEmail('admin@rafiki.com')).toBe(false);
      expect(isAdminEmail(null)).toBe(false);
    });
  });

  describe('roleForEmail', () => {
    it('returns admin for allowlisted emails, user otherwise', () => {
      process.env.ADMIN_EMAILS = 'admin@rafiki.com';
      expect(roleForEmail('admin@rafiki.com')).toBe('admin');
      expect(roleForEmail('someone@rafiki.com')).toBe('user');
    });
  });

  describe('roleFromMetadata', () => {
    it('reads role from metadata, defaulting to user', () => {
      expect(roleFromMetadata({ role: 'admin' })).toBe('admin');
      expect(roleFromMetadata({ role: 'user' })).toBe('user');
      expect(roleFromMetadata({})).toBe('user');
      expect(roleFromMetadata(null)).toBe('user');
    });
  });
});
