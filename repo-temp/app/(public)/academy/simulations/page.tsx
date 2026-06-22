import { redirect } from "next/navigation";

/** Alias route — simulations live under /academy/ai-simulations */
export default function AcademySimulationsRedirect() {
  redirect("/academy/ai-simulations");
}
