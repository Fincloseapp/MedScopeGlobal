import type { Metadata } from "next";

import { redirect } from "next/navigation";



export const metadata: Metadata = {

  title: "Příprava na přijímačky — MedScope Academy",

  description: "Přípravné kurzy MedScope Academy pro zájemce o studium medicíny a přijímačky LF.",

};



export default function AcademyPripravaPage() {

  redirect("/academy/courses?category=prijimacky");

}

