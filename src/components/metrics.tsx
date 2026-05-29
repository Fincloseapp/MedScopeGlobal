import type { FunnelMetric } from "@/lib/types";
export function Metrics({ items }: { items: FunnelMetric[] }) { return <div className="metrics">{items.map((item) => <article className="metric" key={item.label}><strong>{item.value}</strong><span>{item.label}</span><p>{item.detail}</p></article>)}</div>; }
