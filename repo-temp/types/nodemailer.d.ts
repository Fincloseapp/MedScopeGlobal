declare module "nodemailer" {
  export interface SentMessageInfo {
    messageId?: string;
    accepted?: string[];
  }

  export interface Transporter {
    sendMail(mail: Record<string, unknown>): Promise<SentMessageInfo>;
  }

  export function createTransport(options: Record<string, unknown>): Transporter;
}
