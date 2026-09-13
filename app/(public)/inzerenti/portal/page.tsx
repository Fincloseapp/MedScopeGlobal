import type { Metadata } from "next";
import { AdvertiserPortal } from "@/components/sales/advertiser-portal";

export const metadata: Metadata = {
  title: "Portál inzerenta",
  robots: { index: false, follow: false },
};

export default async function AdvertiserPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const query = await searchParams;
  const token = query.token ?? "";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <AdvertiserPortal token={token} />
    </div>
  );
}
