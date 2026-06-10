/** Heslo admin brány — nastavte ADMIN_GATE_PASSWORD ve Vercel env (výchozí pro dev: David3). */

export function getAdminGatePassword(): string {

  return process.env.ADMIN_GATE_PASSWORD ?? "David3";

}


