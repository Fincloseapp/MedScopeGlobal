import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getArticleBySlug } from "@/lib/content";
import { articleJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";
interface PageProps { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { slug } = await params; const article = getArticleBySlug(slug); if (!article) return { title: "Článek nenalezen" }; return { title: article.title, description: article.summary, alternates: { canonical: `/articles/${article.slug}` }, openGraph: { title: article.title, description: article.summary, type: "article", publishedTime: article.date, authors: [article.author], emails: [siteConfig.contactEmail] } }; }
export default async function ArticleDetailPage({ params }: PageProps) { const { slug } = await params; const article = getArticleBySlug(slug); if (!article) notFound(); return <main className="section"><JsonLd data={articleJsonLd(article)} /><article className="card"><span className="tag">{article.specialization}</span><h1>{article.title}</h1><p className="lead">{article.summary}</p><div className="meta"><span>Autor: {article.author}</span><span>{new Intl.DateTimeFormat("cs-CZ").format(new Date(article.date))}</span><span>Zdroj: {article.source}</span><span>{article.readingTime} min čtení</span></div><p>{article.content}</p></article></main>; }
