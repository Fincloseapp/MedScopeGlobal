export type V25ImageType = "illustration" | "icon" | "environment" | "object";

export type V25ImageSource = "selector" | "generator" | "existing" | "manual";

export type V25ImageSection =
  | "articles"
  | "legislation"
  | "drug_news"
  | "university_news"
  | "studies"
  | "digital_health"
  | "university-faculty"
  | "quizzes"
  | "specialty";

export type V25ImageRecord = {
  id: string;
  section: V25ImageSection | string;
  slug: string;
  title: string;
  imageType: V25ImageType;
  source: V25ImageSource;
  publicUrl: string;
  localPath?: string;
  relativePath?: string;
  stylePassed: boolean;
  createdAt: string;
  updatedAt: string;
  contentId?: string;
  keywords?: string[];
  alt?: string;
};

export type V25ImageFixRecord = {
  id: string;
  at: string;
  section: string;
  slug: string;
  action: "generate" | "assign" | "style-reject" | "upload-fail";
  result: "ok" | "fail";
  detail?: string;
};

export type V25ImageReport = {
  at: string;
  total: number;
  generated: number;
  assigned: number;
  failed: number;
  skipped: number;
  missingBefore: number;
  images: V25ImageRecord[];
  fixLog: V25ImageFixRecord[];
};

export type V25ContentImageRow = {
  id: string;
  slug: string;
  section: V25ImageSection | string;
  title: string;
  excerpt?: string;
  body?: string;
  imageUrl?: string | null;
  table: string;
  imageColumn: string;
};

export type V25ImagePipelineResult = {
  ok: boolean;
  report: V25ImageReport;
  detail?: string;
};
