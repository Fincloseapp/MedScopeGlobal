export type VideoChapter = {
  title: string;
  start_sec: number;
  end_sec?: number;
};

export type VideoMetadata = {
  id: string;
  title: string;
  duration_seconds: number;
  description?: string;
  thumbnail_url?: string | null;
  chapters: VideoChapter[];
  hls_url?: string | null;
  mp4_url?: string | null;
  public_url?: string | null;
  url_chain: string[];
  access: "public" | "student" | "doctor";
  status: string;
};

export type WatchEventType = "play" | "pause" | "seek" | "ended" | "heartbeat" | "error";

export type WatchEventPayload = {
  event: WatchEventType;
  position_sec: number;
  session_id: string;
};
