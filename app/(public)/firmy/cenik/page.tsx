import { redirect } from "next/navigation";

/** B2B pricing alias — canonical listing lives under /inzerce/cenik. */
export default function FirmyCenikPage() {
  redirect("/inzerce/cenik");
}
