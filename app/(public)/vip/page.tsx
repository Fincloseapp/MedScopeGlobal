import { redirect } from "next/navigation";

/** Bare /vip → VIP longevity protocols listing */
export default function VipIndexPage() {
  redirect("/vip/protokoly");
}
