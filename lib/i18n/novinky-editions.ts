import type { NovinkyCopy } from "@/lib/i18n/novinky-copy";

export type NovinkyEdition = {
  tags?: Partial<Record<keyof NovinkyCopy["tags"], Partial<NovinkyCopy["tags"][keyof NovinkyCopy["tags"]]>>>;
};

const EDITIONS: Record<string, NovinkyEdition> = {
  sk: {
    tags: {
      univerzity: { label: "Univerzity", title: "Univerzity", description: "Novinky z lekárskych fakúlt — české inštitúcie tu nie sú miestna rada." },
      vyzkum: { label: "Výskum", title: "Výskum", description: "Výskumné novinky s identifikátorom, bez vymyslených grantov." },
      kalendar: { label: "Kalendár", title: "Kalendár", description: "Termíny z univerzít. České akcie patria do českej edície." },
    },
  },
  pl: {
    tags: {
      univerzity: { label: "Uczelnie", title: "Uczelnie", description: "Nowości z wydziałów lekarskich — czeskie instytucje nie są tu lokalną radą." },
      vyzkum: { label: "Badania", title: "Badania", description: "Nowości badawcze z identyfikatorem, bez wymyślonych grantów." },
      kalendar: { label: "Kalendarz", title: "Kalendarz", description: "Terminy uczelni. Czeskie wydarzenia zostają w edycji czeskiej." },
    },
  },
  ja: {
    tags: {
      univerzity: { label: "大学", title: "大学", description: "医学部のニュース — チェコの機関はここでは現地の助言ではありません。" },
      vyzkum: { label: "研究", title: "研究", description: "識別子付きの研究ニュース。捏造助成金なし。" },
      kalendar: { label: "カレンダー", title: "カレンダー", description: "大学の日程。チェコの行事はチェコ版に残ります。" },
    },
  },
};

export function novinkyEdition(primary: string): NovinkyEdition | undefined {
  return EDITIONS[primary];
}
