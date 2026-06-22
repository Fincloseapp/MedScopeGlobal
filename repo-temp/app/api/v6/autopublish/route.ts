import { createV6RouteHandlers } from "@/lib/v6/v6-api-handlers";

export const { GET, PUT, POST } = createV6RouteHandlers("autopublish");
