import type { ExchangeCopy } from "@/lib/i18n/exchange-copy";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";

type Edition = Partial<ExchangeCopy>;

const EDITIONS: Record<string, Edition> = {
  sk: {
    metaTitle: "MedScope B2B Exchange — zdravotnícky marketplace bez provízie za kontakt",
    eyebrow: "B2B Exchange",
    title: "Zdravotnícky marketplace, ktorý firmy chcú používať",
    lead: "Ponúkajte produkty a služby klinikám, laboratóriám a univerzitám. Kupujúci vás kontaktuje priamo. MedScopeGlobal nespracúva platby, zmluvy ani dodanie.",
    catalogCta: "Prehliadnuť ponuky",
    onboardCta: "Registrovať firmu",
    catalogTitle: "Katalóg ponúk",
    kindProduct: "Produkty",
    kindService: "Služby",
    kindDemand: "Dopyty",
    filterRegion: "Región",
    contactCta: "Kontaktovať inzerenta",
    termsTitle: "Obchodné podmienky Exchange",
    privacyTitle: "Ochrana súkromia Exchange",
  },
  pl: {
    metaTitle: "MedScope B2B Exchange — marketplace medyczny bez prowizji za kontakt",
    eyebrow: "B2B Exchange",
    title: "Marketplace medyczny, z którego firmy naprawdę korzystają",
    lead: "Oferujcie produkty i usługi klinikom, laboratoriom i uczelniom. Kupujący kontaktuje się bezpośrednio. MedScopeGlobal nie obsługuje płatności, umów ani dostaw.",
    catalogCta: "Przeglądaj oferty",
    onboardCta: "Zarejestruj firmę",
    catalogTitle: "Katalog ofert",
    kindProduct: "Produkty",
    kindService: "Usługi",
    kindDemand: "Zapytania",
    filterRegion: "Region",
    contactCta: "Kontakt z ogłoszeniodawcą",
    termsTitle: "Regulamin Exchange",
    privacyTitle: "Polityka prywatności Exchange",
  },
  hu: {
    metaTitle: "MedScope B2B Exchange — egészségügyi piactér kapcsolati jutalék nélkül",
    eyebrow: "B2B Exchange",
    title: "Az egészségügyi piactér, amelyet a cégek tényleg használnak",
    lead: "Termékek és szolgáltatások klinikáknak, laboroknak és egyetemeknek. A vevő közvetlenül keresi. A MedScopeGlobal nem kezel fizetést, szerződést vagy szállítást.",
    catalogCta: "Ajánlatok böngészése",
    onboardCta: "Szervezet regisztrálása",
    catalogTitle: "Ajánlati katalógus",
    kindProduct: "Termékek",
    kindService: "Szolgáltatások",
    kindDemand: "Igények",
    filterRegion: "Régió",
    contactCta: "Hirdető kapcsolatfelvétel",
    termsTitle: "Exchange általános szerződési feltételek",
    privacyTitle: "Exchange adatvédelem",
  },
};

export function exchangeEdition(locale?: string | null): Edition | null {
  const primary = primaryArticleLocale(normalizeLocale(locale ?? "cs"));
  return EDITIONS[primary] ?? null;
}
