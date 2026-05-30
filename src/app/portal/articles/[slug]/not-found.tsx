import Link from "next/link";

export default function PortalArticleNotFound() {
  return (
    <main className="section">
      <div className="empty">
        <h1>Článek nebyl nalezen</h1>
        <p>Požadovaný odborný článek neexistuje nebo ještě nebyl publikován.</p>
        <div className="actions">
          <Link className="button primary" href="/portal/articles">
            Procházet články
          </Link>
          <Link className="button" href="/portal">
            Zpět na portál
          </Link>
        </div>
      </div>
    </main>
  );
}
