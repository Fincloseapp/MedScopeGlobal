import type { ExchangeListing, ExchangeOrganization } from "@/lib/exchange/types";

/** Public catalogue and company pages never expose advertiser email or phone. */
export function publicOrganization(org: ExchangeOrganization): ExchangeOrganization {
  return {
    ...org,
    contactEmail: "",
    contactPhone: null,
    contactPerson: "",
  };
}

export function publicListing(listing: ExchangeListing): ExchangeListing {
  return listing;
}

export function publicListings(items: ExchangeListing[]): ExchangeListing[] {
  return items.map(publicListing);
}
