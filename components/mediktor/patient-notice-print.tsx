"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PatientNoticePrint() {
  return (
    <div className="mt-8 print:hidden">
      <Button
        type="button"
        className="h-11 rounded-full bg-[#005B96]"
        onClick={() => window.print()}
      >
        <Printer className="mr-2 h-4 w-4" />
        Vytisknout / uložit jako PDF
      </Button>
      <p className="mt-2 text-xs text-slate-500">
        Vyvěste v čekárně, nebo ukažte na tabletu před konzultací.
      </p>
    </div>
  );
}
