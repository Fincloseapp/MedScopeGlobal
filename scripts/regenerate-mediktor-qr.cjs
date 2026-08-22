const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const jsQR = require("jsqr");

const ROOT = path.resolve(__dirname, "..");
const TARGET = "https://medscopeglobal.com/mediktor";
const APP_TARGET = "https://medscopeglobal.com/app/mediktor?source=qr";

async function fetchQrPng(url, size) {
  const api =
    "https://api.qrserver.com/v1/create-qr-code/?size=" +
    size +
    "x" +
    size +
    "&ecc=M&margin=2&data=" +
    encodeURIComponent(url);
  const res = await fetch(api);
  if (!res.ok) throw new Error("QR provider " + res.status);
  return Buffer.from(await res.arrayBuffer());
}

async function decodePngBuffer(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const code = jsQR(new Uint8ClampedArray(data), info.width, info.height);
  return code && code.data;
}

async function findQrBox(flyerPath) {
  const meta = await sharp(flyerPath).metadata();
  const { data, info } = await sharp(flyerPath)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const startY = Math.floor(info.height * 0.7);
  const startX = Math.floor(info.width * 0.55);
  let best = null;
  for (let size = 110; size <= 200; size += 4) {
    for (let y = startY; y + size < info.height - 10; y += 3) {
      for (let x = startX; x + size < info.width - 10; x += 3) {
        let dark = 0;
        let total = 0;
        for (let yy = y; yy < y + size; yy += 2) {
          for (let xx = x; xx < x + size; xx += 2) {
            const v = data[yy * info.width + xx];
            total++;
            if (v < 90) dark++;
          }
        }
        const ratio = dark / total;
        if (ratio > 0.28 && ratio < 0.62) {
          const score = 1 - Math.abs(ratio - 0.45);
          if (!best || score > best.score) {
            best = { left: x, top: y, width: size, height: size, ratio, score };
          }
        }
      }
    }
  }
  return { meta, best };
}

async function main() {
  const flyerPath = path.join(ROOT, "public/assets/mediktor/hero-flyer.png");
  const publicQrPath = path.join(ROOT, "public/dokumentace-qr.png");

  const publicQr = await fetchQrPng(APP_TARGET, 360);
  fs.writeFileSync(publicQrPath, publicQr);
  console.log("wrote dokumentace-qr.png", publicQr.length, "decode", await decodePngBuffer(publicQr));

  const { meta, best } = await findQrBox(flyerPath);
  console.log("flyer", meta.width, meta.height, "detected", best);
  if (!best) throw new Error("Could not locate QR box on flyer");

  const pad = 6;
  const left = Math.max(0, best.left - pad);
  const top = Math.max(0, best.top - pad);
  const width = Math.min(meta.width - left, best.width + pad * 2);
  const height = Math.min(meta.height - top, best.height + pad * 2);

  const flyerQr = await fetchQrPng(TARGET, Math.max(width, height));
  const qrResized = await sharp(flyerQr).resize(width, height, { fit: "fill" }).png().toBuffer();

  const out = await sharp(flyerPath)
    .composite([{ input: qrResized, left, top }])
    .png()
    .toBuffer();
  fs.writeFileSync(flyerPath, out);
  console.log("composited flyer QR at", { left, top, width, height });

  const crop = await sharp(flyerPath).extract({ left, top, width, height }).png().toBuffer();
  const decoded = await decodePngBuffer(
    await sharp(crop).resize(700, 700, { fit: "fill" }).png().toBuffer()
  );
  console.log("flyer QR decode", decoded);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});