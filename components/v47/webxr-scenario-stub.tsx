"use client";

import type { XrScenario } from "@/lib/v47/xr/scenario";

type Props = {
  scenario: XrScenario;
};

/** WebXR clinical scenario stub — full WebXR session requires HTTPS + headset. */
export function WebXrScenarioStub({ scenario }: Props) {
  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-6">
      <h3 className="font-semibold text-violet-900">{scenario.title}</h3>
      <p className="mt-1 text-sm text-violet-700">{scenario.description}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-violet-800">
        {scenario.steps.map((step, i) => (
          <li key={i}>
            <span className="font-medium">{step.action}</span>
            <span className="text-violet-600"> — {step.feedback}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-violet-600">
        WebXR: {scenario.webxrSupported ? "supported" : "stub mode — use Academy simulations"}
      </p>
    </div>
  );
}
