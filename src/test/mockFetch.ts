import { vi } from 'vitest';

export function mockEmptyFetch() {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ items: [] }),
    text: async () => '<rss><channel /></rss>',
  } as Response);
}
