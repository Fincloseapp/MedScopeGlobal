export type SocialPlatform = "tiktok" | "instagram" | "youtube" | "linkedin";

export async function publishToSocial(input: {
  platform: SocialPlatform;
  title: string;
  content: string;
  mediaUrl?: string;
}) {
  const keyEnv: Record<SocialPlatform, string> = {
    tiktok: "TIKTOK_API_KEY",
    instagram: "INSTAGRAM_API_KEY",
    youtube: "YOUTUBE_API_KEY",
    linkedin: "LINKEDIN_API_KEY",
  };

  const keyName = keyEnv[input.platform];
  const configured = Boolean(process.env[keyName]?.trim());

  if (!configured) {
    return {
      ok: false as const,
      scaffold: true,
      platform: input.platform,
      error: `${keyName} not configured`,
      draft: { title: input.title, content: input.content.slice(0, 500), mediaUrl: input.mediaUrl ?? null },
    };
  }

  return {
    ok: true as const,
    platform: input.platform,
    postId: `stub-${input.platform}-${Date.now()}`,
    message: "Social publish stub — wire platform SDK when API keys are set",
  };
}
