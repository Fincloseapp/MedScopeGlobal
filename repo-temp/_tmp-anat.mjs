const base = "https://medscopeglobal.com";
for (const slug of ["anatomie-zaklady-uchazece", "latinska-terminologie-medicina"]) {
  console.log("\n===", slug);
  const coursePage = await (await fetch(`${base}/academy/courses/${slug}`)).text();
  const lessons = [...coursePage.matchAll(new RegExp(`/academy/courses/${slug}/lessons/([a-z0-9-]+)`, "gi"))];
  const first = lessons[0]?.[1];
  console.log("first lesson", first, "total links", lessons.length);
  if (first) {
    const r = await fetch(`${base}/academy/courses/${slug}/lessons/${first}`);
    console.log("status", r.status);
    const html = await r.text();
    console.log("video", /<video/i.test(html), "mp4", /src=.*mp4/i.test(html), "len", html.length);
    if (r.status !== 200) console.log(html.slice(0, 300));
  }
}
