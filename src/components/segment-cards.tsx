import Link from "next/link";

const segments = [
  {
    title: "Laik a student",
    description:
      "Srozumitelné vysvětlení, příprava na medicínu a studijní materiály bez zbytečného žargonu.",
    href: "/pro-koho/laik-student",
    cta: "Vstoupit jako student"
  },
  {
    title: "Lékař v praxi",
    description:
      "Praktické články, evidence digesty a rozhodovací podpora pro každodenní klinickou praxi.",
    href: "/pro-koho/lekar",
    cta: "Obsah pro praxi"
  },
  {
    title: "Vědec a výzkum",
    description:
      "Monitoring publikací, klinické studie a výzkumné přehledy s citacemi a metadaty.",
    href: "/pro-koho/vedec",
    cta: "Research monitoring"
  }
];

export function SegmentCards() {
  return (
    <div className="segment-grid grid">
      {segments.map((segment) => (
        <article key={segment.href} className="card segment-card">
          <h3>{segment.title}</h3>
          <p>{segment.description}</p>
          <Link className="button primary" href={segment.href}>
            {segment.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}
