import { sendEmail } from "@/lib/email/engine";
import { salesInquiryForwardEmail, salesPartnerUrl } from "@/lib/sales/copy";
import { salesPackageById } from "@/lib/sales/packages";
import { addDaysIso } from "@/lib/sales/ids";
import {
  insertEvent,
  updateContract,
  updateInquiry,
  type SalesClient,
} from "@/lib/sales/store";
import type { SalesContract, SalesInquiry, SalesProspect } from "@/lib/sales/types";

function fallbackCreative(): string {
  return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop";
}

export async function activateFulfillment(
  db: SalesClient,
  contract: SalesContract,
  prospect: SalesProspect
): Promise<{ adsIds: string[]; error?: string }> {
  const pkg = salesPackageById(contract.package_id);
  if (!pkg) return { adsIds: [], error: "unknown_package" };

  const start = contract.period_start ?? new Date().toISOString().slice(0, 10);
  const end = contract.period_end ?? addDaysIso(new Date(), 31).slice(0, 10);
  const imageUrl = contract.creative_url || fallbackCreative();
  const linkUrl = contract.target_url || salesPartnerUrl(contract.landing_slug);
  const adsIds: string[] = [...(contract.ads_ids ?? [])];

  for (const placement of pkg.placements) {
    const { data, error } = await db
      .from("ads")
      .insert({
        title: prospect.company,
        image_url: imageUrl,
        link_url: linkUrl,
        target_url: linkUrl,
        active: true,
        placement,
        company: prospect.company,
        client_name: prospect.contact_name,
        client_email: prospect.email,
        ico: prospect.ico,
        dic: prospect.dic,
        type: "package",
        ad_text: contract.offer_text || `${prospect.company} — označená inzerce MedScopeGlobal`,
        price: contract.monthly_czk,
        start_date: start,
        end_date: end,
        ad_status: "active",
        include_in_newsletter: Boolean(pkg.newsletter),
        position_newsletter: pkg.newsletter,
      })
      .select("id")
      .maybeSingle();
    if (error) {
      console.warn("[sales] ads insert", error.message);
      continue;
    }
    if (data?.id) adsIds.push(String(data.id));
  }

  await updateContract(db, contract.id, {
    status: "active",
    ads_ids: adsIds,
  });
  await insertEvent(db, "fulfillment_activated", { adsIds, packageId: pkg.id }, {
    prospect_id: prospect.id,
    contract_id: contract.id,
  });
  return { adsIds };
}

export async function pauseFulfillment(db: SalesClient, contract: SalesContract): Promise<void> {
  for (const id of contract.ads_ids ?? []) {
    await db.from("ads").update({ active: false, ad_status: "paused" }).eq("id", id);
  }
  await updateContract(db, contract.id, { status: "paused" });
}

export async function resumeFulfillment(db: SalesClient, contract: SalesContract): Promise<void> {
  for (const id of contract.ads_ids ?? []) {
    await db.from("ads").update({ active: true, ad_status: "active" }).eq("id", id);
  }
  await updateContract(db, contract.id, { status: "active", grace_until: null });
}

export function inquirySlaDue(hours: number | null, from = new Date()): string | null {
  if (!hours || hours <= 0) return null;
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export async function fulfillInquiry(
  db: SalesClient,
  inquiry: SalesInquiry,
  contract: SalesContract | null,
  prospect: SalesProspect | null
): Promise<{ forwarded: boolean; held: boolean }> {
  const pkg = contract ? salesPackageById(contract.package_id) : null;
  const paid = contract?.status === "active";
  if (!contract || !paid || !pkg?.inquiryForward || !prospect?.email) {
    await updateInquiry(db, inquiry.id, { status: "held_unpaid" });
    return { forwarded: false, held: true };
  }

  const letter = salesInquiryForwardEmail({
    advertiser: prospect.company,
    senderName: inquiry.sender_name,
    senderEmail: inquiry.sender_email,
    message: inquiry.message,
    landingUrl: salesPartnerUrl(contract.landing_slug),
  });
  const sent = await sendEmail({
    to: prospect.email,
    replyTo: inquiry.sender_email,
    subject: letter.subject,
    html: letter.html,
    text: letter.text,
    category: "transactional",
    metadata: { kind: "sales_inquiry", inquiryId: inquiry.id, contractId: contract.id },
  });
  if (!sent.ok) {
    await updateInquiry(db, inquiry.id, { status: "received" });
    return { forwarded: false, held: false };
  }
  await updateInquiry(db, inquiry.id, {
    status: "forwarded",
    forwarded_at: new Date().toISOString(),
  });
  return { forwarded: true, held: false };
}
