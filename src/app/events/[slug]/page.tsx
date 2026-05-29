import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventIcsButton } from "@/components/event-ics-button";
import { JsonLd } from "@/components/json-ld";
import { getEventBySlug } from "@/lib/content";
import { eventJsonLd } from "@/lib/json-ld";
interface PageProps { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: PageProps): Promise<Metadata> { const { slug } = await params; const event = getEventBySlug(slug); if (!event) return { title: "Událost nenalezena" }; return { title: event.title, description: event.description, alternates: { canonical: `/events/${event.slug}` }, openGraph: { title: event.title, description: event.description, type: "website" } }; }
export default async function EventDetailPage({ params }: PageProps) { const { slug } = await params; const event = getEventBySlug(slug); if (!event) notFound(); return <main className="section"><JsonLd data={eventJsonLd(event)} /><article className="card"><span className="tag">{event.format}</span><h1>{event.title}</h1><p className="lead">{event.description}</p><div className="meta"><span>{new Intl.DateTimeFormat("cs-CZ", { dateStyle: "full", timeStyle: "short" }).format(new Date(event.startsAt))}</span><span>{event.region}</span><span>{event.specialization}</span><span>{event.organizer}</span>{event.venue ? <span>{event.venue}</span> : null}</div><div className="actions"><EventIcsButton slug={event.slug} title={event.title} />{event.registrationUrl ? <a className="button primary" href={event.registrationUrl}>Registrovat</a> : null}</div></article></main>; }
