export type EmailCategory = "transactional" | "system" | "marketing";

export type EmailSendStatus = "sent" | "failed" | "skipped";

export type EmailProvider = "sendgrid" | "smtp" | "none";

export interface EmailAttachment {
  filename: string;
  /** Raw text/html body, or base64 when encoding === "base64". */
  content: string;
  type?: string;
  disposition?: "attachment" | "inline";
  encoding?: "utf8" | "base64";
}

export interface EmailSendRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  category: EmailCategory;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  metadata?: Record<string, unknown>;
  /** SendGrid marketing list — uses list_ids instead of to[] when set. */
  sendGridListId?: string;
}

export interface EmailSendResponse {
  ok: boolean;
  status: EmailSendStatus;
  provider: EmailProvider;
  fallbackUsed: boolean;
  statusCode?: number;
  messageId?: string;
  error?: string;
  loggedAt: string;
  category: EmailCategory;
  recipient: string;
  raw?: Record<string, unknown>;
}
