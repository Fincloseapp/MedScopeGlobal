import Link from "next/link";
import type { ContentTier } from "@/lib/types";

const tierLabels: Record<ContentTier, string> = {
  free: "Veřejné",
  premium: "Premium",
  institutional: "Instituce"
};

export function TierBadge({ tier }: { tier: ContentTier }) {
  return <span className={`tag tier-${tier}`}>{tierLabels[tier]}</span>;
}

export function PremiumGatePanel() {
  return (
    <aside className="card premium-gate" aria-labelledby="premium-gate-title">
      <TierBadge tier="premium" />
      <h2 id="premium-gate-title">Premium obsah</h2>
      <p>
        Klinické digesty, decision-support materiály a pokročilé filtry jsou dostupné s Premium členstvím nebo
        institucionální licencí.
      </p>
      <div className="actions">
        <Link className="button primary" href="/premium">
          Zobrazit Premium
        </Link>
        <Link className="button" href="/institutions">
          Institucionální přístup
        </Link>
      </div>
    </aside>
  );
}
