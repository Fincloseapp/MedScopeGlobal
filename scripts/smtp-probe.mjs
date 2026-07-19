import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM_EMAIL || "info@medscopeglobal.com";
const to = process.env.ADMIN_NOTIFY_EMAIL || from;

console.log(
  JSON.stringify({
    host,
    port,
    user,
    from,
    to,
    passLen: (pass || "").length,
    secure: true,
  })
);

const transport = nodemailer.createTransport({
  host,
  port,
  secure: true,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log("verify=OK");
} catch (e) {
  console.log("verify=FAIL");
  console.log("verify_code=" + (e.code || ""));
  console.log("verify_response=" + String(e.response || e.message || e).slice(0, 300));
}

try {
  const info = await transport.sendMail({
    from: `"MedScopeGlobal" <${from}>`,
    to,
    subject: "[MedScope] Cloudflare SMTP probe",
    text: "Cloudflare Email Sending probe from MedScope setup.",
    html: "<p>Cloudflare Email Sending probe from MedScope setup.</p>",
  });
  console.log("send=OK");
  console.log("messageId=" + (info.messageId || ""));
} catch (e) {
  console.log("send=FAIL");
  console.log("send_code=" + (e.code || ""));
  console.log("send_command=" + (e.command || ""));
  console.log("send_response=" + String(e.response || e.message || e).slice(0, 400));
}
