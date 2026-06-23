export type ExtractedResult = {
  symptoms: string[];
  diagnoses: string[];
  treatments: string[];
  risks: string[];
  facts: string[];
};

export type EvaluatedItem = {
  item: string;
  category: "symptom" | "diagnosis" | "treatment" | "risk" | "fact";
  relevance: number;
  evidenceLevel: "low" | "moderate" | "high";
};

export type EvaluatedResult = {
  items: EvaluatedItem[];
};

export type ComparedResult = {
  conflicts: Array<{ a: string; b: string; reason: string }>;
  alignments: Array<{ items: string[]; note: string }>;
  priorities: Array<{ item: string; score: number; category: string }>;
};

export type InferredResult = {
  conclusion: string;
  reasoningChain: string[];
  confidence: number;
};

export type ReasoningPipelinePayload = {
  extracted: ExtractedResult;
  evaluated: EvaluatedResult;
  compared: ComparedResult;
  inferred: InferredResult;
};
