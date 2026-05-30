import Link from "next/link";

const segments = [
  {
    title: "Klinici",
    description: "Praktické články, evidence digesty a rozhodovací podpora pro každodenní praxi.",
    href: "/portal/articles",
    cta: "Odborný portál"
  },
  {
    title: "Vědci & výzkum",
    description: "Monitoring publikací, klinické studie a datové roundtable s citacemi.",
    href: "/articles?audience=researcher",
    cta: "Research monitoring"
  },
  {
    title: "Instituce",
    description: "Licence pro nemocnice, univerzity a výzkumné organizace s RBAC a reportingem.",
    href: "/institutions",
    cta: "Institucionální nabídka"
  },
  {
    title: "Partneři & B2B",
    description: "Měřitelné kampaně, eventy a lead generation s transparentním označením.",
    href: "/b2b",
    cta: "B2B partnerství"
  }
];

export function SegmentCards() {
  return (
    <div className="grid segment-grid">
      {segments.map((segment) => (
        <article className="card segment-card" key={segment.title}>
          <h3>{segment.title}</h3>
          <p>{segment.description}</p>
          <Link className="button" href={segment.href}>
            {segment.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
