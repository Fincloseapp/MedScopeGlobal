/** Find working Unsplash URLs for slide images */
const candidates = {
  anatomy: [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=800&q=80",
  ],
  skeleton: [
    "https://images.unsplash.com/photo-1532187863486-abf9db1a4690?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  heart: [
    "https://images.unsplash.com/photo-1628348068343-c6a848d2a385?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  circulation: [
    "https://images.unsplash.com/photo-1559757175-5700cde872bc?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  nutrition: [
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  ],
  pharmacy: [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  cell: [
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  chemistry: [
    "https://images.unsplash.com/photo-1532636865606-79b0b8b44644?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  physics: [
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  physiology: [
    "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
  ],
  muscle: [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  lung: [
    "https://images.unsplash.com/photo-1628595357799-9c8c8fd22790?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  exam: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
  health: [
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  ],
};

async function head(url) {
  const r = await fetch(url, { method: "HEAD", redirect: "follow" });
  return r.status;
}

const picked = {};
for (const [key, urls] of Object.entries(candidates)) {
  for (const u of urls) {
    const s = await head(u);
    console.log(key, s, u.split("/photo-")[1]?.slice(0, 30));
    if (s === 200 && !picked[key]) picked[key] = u;
  }
}
console.log("\n=== PICKED ===");
console.log(JSON.stringify(picked, null, 2));
