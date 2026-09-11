/** Cloudflare user tokens pass `/user/tokens/verify`. Account-owned tokens do not. */

export async function isValidCloudflareApiToken(token: string): Promise<boolean> {
  const headers = { Authorization: `Bearer ${token}` };
  const urls = ["https://api.cloudflare.com/client/v4/user/tokens/verify"];
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  if (accountId) {
    urls.push(`https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`);
  }
  // Account API tokens can list accounts even when /user/tokens/verify returns 1000.
  urls.push("https://api.cloudflare.com/client/v4/accounts?per_page=1");

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      const data = (await res.json()) as { success?: boolean };
      if (res.ok && data.success) return true;
    } catch {
      /* try the next probe */
    }
  }
  return false;
}
