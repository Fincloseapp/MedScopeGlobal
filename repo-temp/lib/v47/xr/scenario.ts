export type XrScenario = {
  id: string;
  title: string;
  description: string;
  steps: Array<{ action: string; feedback: string }>;
  webxrSupported: boolean;
};

export function buildXrScenario(input: { topic: string; difficulty?: string }): XrScenario {
  return {
    id: `xr-${Date.now()}`,
    title: input.topic,
    description: `WebXR clinical scenario stub — ${input.difficulty ?? "intermediate"}`,
    steps: [
      { action: "Enter examination room", feedback: "Environment loaded (stub)" },
      { action: "Assess patient", feedback: "Use Academy simulation for full AI patient" },
      { action: "Document findings", feedback: "XP awarded on completion (stub)" },
    ],
    webxrSupported: false,
  };
}
