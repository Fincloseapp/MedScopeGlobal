export const EXCHANGE_TARGET_LOCALES = ["en", "cs", "de", "fr", "it", "es", "pl", "sk", "hu"] as const;
export type ExchangeUiLocale = (typeof EXCHANGE_TARGET_LOCALES)[number];
