"use client";
import Link from "next/link";
import { trackClientEvent } from "./analytics-provider";
export function EventIcsButton({ slug, title }: { slug: string; title: string }) { return <Link className="button" href={`/events/${slug}/calendar`} onClick={() => trackClientEvent({ name: "calendar_click", value: { slug, title } })}>Přidat do kalendáře (.ics)</Link>; }
