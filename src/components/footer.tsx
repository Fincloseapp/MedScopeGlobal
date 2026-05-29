import Link from "next/link";
import { siteConfig } from "@/lib/site";
export function Footer() { return <footer className="footer"><div><strong>MedScopeGlobal</strong><p>Globální platforma pro sdílení medicínských poznatků.</p></div><div><h2>Kontakt</h2><p><a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a> - Hlavní kontakt</p><p><a href={`mailto:${siteConfig.adsEmail}`}>{siteConfig.adsEmail}</a> - Reklamy a inzerce</p></div><div><h2>Platforma</h2><Link href="/articles">Články</Link><Link href="/events">Události</Link><Link href="/b2b">B2B</Link></div></footer>; }
