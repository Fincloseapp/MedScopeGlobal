import { errorResponse } from "./request";

function isDatabaseError(message: string) {
  return /P1001|P1017|ECONNREFUSED|ETIMEDOUT|Can't reach database|Connection terminated|connect/i.test(message);
}

export async function withPortalApi(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[portal-api]", message);
    if (isDatabaseError(message)) {
      return errorResponse("Dočasná chyba databáze. Portál běží v demo režimu.", 503);
    }
    return errorResponse(message, 500);
  }
}
