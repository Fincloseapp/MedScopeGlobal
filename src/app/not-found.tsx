import Link from "next/link";
export default function NotFound() { return <main className="section"><div className="empty"><h1>Stránka nebyla nalezena.</h1><p>Obsah mohl být přesunut nebo zatím čeká na schválení.</p><Link className="button primary" href="/">Zpět na hlavní stránku</Link></div></main>; }
