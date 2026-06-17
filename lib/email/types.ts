export type EmailCategory = "transactional" | "system" | "marketing";

export type EmailSendStatus = "sent" | "failed" | "skipped";

export type EmailProvider = "sendgrid" | "smtp" | "none";

export interface EmailAttachment {
  filename: string;
  content: string;
  type?: string;
  disposition?: "attachment" | "inline";
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
