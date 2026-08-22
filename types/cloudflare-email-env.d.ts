/** Ambient Cloudflare Env augmentation for OpenNext + Email Service. */
declare global {
  interface CloudflareEnv {
    EMAIL?: {
      send: (message: unknown) => Promise<{ messageId: string }>;
    };
  }
}

export {};
