import { rateLimit, rateLimitResponse, getClientId } from '../rate-limit';

// Minimal stand-in for NextRequest: only `headers.get` is used by the module.
function mockRequest(headers: Record<string, string>) {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    lower[k.toLowerCase()] = v;
  }
  return {
    headers: {
      get: (name: string) => lower[name.toLowerCase()] ?? null,
    },
  } as any;
}

describe('rate-limit', () => {
  describe('getClientId', () => {
    it('prefers x-forwarded-for', () => {
      const req = mockRequest({
        'x-forwarded-for': '203.0.113.5',
        'x-real-ip': '10.0.0.1',
        'user-agent': 'jest',
      });
      expect(getClientId(req)).toBe('203.0.113.5:jest');
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      const req = mockRequest({
        'x-real-ip': '10.0.0.1',
        'user-agent': 'jest',
      });
      expect(getClientId(req)).toBe('10.0.0.1:jest');
    });

    it('uses "unknown" for both ip and user-agent when headers are missing', () => {
      const req = mockRequest({});
      expect(getClientId(req)).toBe('unknown:unknown');
    });
  });

  describe('rateLimit', () => {
    it('allows the request and returns rate-limit headers (placeholder impl)', async () => {
      const req = mockRequest({ 'x-forwarded-for': '1.2.3.4' });
      const result = await rateLimit(req, '/api/v1/');

      expect(result.allowed).toBe(true);
      expect(result.headers['X-RateLimit-Limit']).toBe('100');
      expect(result.headers['X-RateLimit-Remaining']).toBe('99');
      // Reset should be a valid future ISO timestamp.
      const reset = new Date(result.headers['X-RateLimit-Reset']).getTime();
      expect(reset).toBeGreaterThan(Date.now());
    });
  });

  describe('rateLimitResponse', () => {
    it('returns a 429 response with Retry-After and merged headers', async () => {
      const response = rateLimitResponse({ 'X-RateLimit-Limit': '100' });

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
      await expect(response.json()).resolves.toEqual({
        error: 'Rate limit exceeded',
      });
    });
  });
});
