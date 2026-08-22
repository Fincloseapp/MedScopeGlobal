"use client";

import { useEffect, useState } from "react";
import {
  applyMpTextSize,
  clearMpTextSizeFromDocument,
  parseMpTextSize,
  readMpTextSize,
  writeMpTextSize,
  type MpTextSize,
} from "@/lib/medipacient/prefs";

export function useMeDipacientTextSize() {
  const [size, setSizeState] = useState<MpTextSize>("normal");

  useEffect(() => {
    const next = readMpTextSize();
    setSizeState(next);
    applyMpTextSize(next);
    return () => clearMpTextSizeFromDocument();
  }, []);

  function setSize(next: MpTextSize) {
    const value = parseMpTextSize(next);
    setSizeState(value);
    writeMpTextSize(value);
    applyMpTextSize(value);
  }

  return { size, setSize };
}
