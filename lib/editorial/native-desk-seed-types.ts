export type NativeDeskTopic =
  | "dlouhovekost"
  | "zivotni-styl"
  | "prevence"
  | "novinky"
  | "nemoci"
  | "rozhovory";

export type NativeDeskSeed = {
  slugTail: string;
  title: string;
  excerpt: string;
  topic: NativeDeskTopic;
  keywords: string[];
  sections: { h2: string; paras: string[]; list?: string[] }[];
};
