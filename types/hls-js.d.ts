declare module "hls.js" {
  export default class Hls {
    static isSupported(): boolean;
    static Events: {
      MANIFEST_PARSED: string;
      ERROR: string;
    };
    constructor(config?: { enableWorker?: boolean });
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
    destroy(): void;
  }
}
