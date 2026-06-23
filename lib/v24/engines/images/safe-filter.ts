const UNSAFE = [/gore/i, /explicit/i, /identifiable\s+patient/i, /real\s+patient\s+photo/i];

export function filterSafeImage(svg: string, alt: string) {
  const issues = UNSAFE.filter((re) => re.test(svg) || re.test(alt)).map((re) => re.source);
  return { passed: issues.length === 0, issues };
}
