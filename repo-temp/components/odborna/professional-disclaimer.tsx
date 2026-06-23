export function ProfessionalDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      className={
        className ??
        "rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-950"
      }
    >
      <p className="font-semibold">Právní upozornění — odborný obsah (úroveň 3)</p>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        <li>
          Obsah je určen výhradně zdravotnickým pracovníkům s platným ověřením
          v registru ČLK dle zákona č. 95/2004 Sb.
        </li>
        <li>
          Nepředstavuje individuální lékařskou radu ani náhradu klinického
          rozhodování — rozhodnutí vždy náleží ošetřujícímu lékaři.
        </li>
        <li>
          Přístup je auditován (logy v Supabase a lokálním úložišti) v souladu s
          požadavky GDPR a interními směrnicemi MedScope.
        </li>
        <li>
          Šíření mimo ověřenou odbornou skupinu je zakázáno.
        </li>
      </ul>
    </aside>
  );
}
