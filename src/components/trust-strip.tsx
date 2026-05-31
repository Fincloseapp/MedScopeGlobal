import { trustSignals } from "@/lib/site";

export function TrustStrip() {
  return (
    <div className="trust-strip" role="list" aria-label="Důvěryhodnost platformy">
      {trustSignals.map((signal) => (
        <span key={signal} role="listitem" className="trust-chip">
          {signal}
        </span>
      ))}
    </div>
  );
}
