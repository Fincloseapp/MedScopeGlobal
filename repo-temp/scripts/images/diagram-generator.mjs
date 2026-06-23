#!/usr/bin/env node
/** v24.6 Image AI — SVG diagram */
export function diagramSvg(title, items = []) {
  const nodes = items.slice(0, 4).map((t, i) => `<text x="40" y="${60 + i * 28}" font-size="13">${t}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240"><rect width="100%" height="100%" fill="#f8fbfd"/><text x="40" y="36" font-weight="600">${title}</text>${nodes}</svg>`;
}
