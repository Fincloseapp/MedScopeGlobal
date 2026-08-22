/** PNG encoder for grayscale (and RGB) bitmaps. No PHI. Workers-safe, no node:zlib. */

const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function be32(value: number): Uint8Array {
  return Uint8Array.of((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new Uint8Array([type.charCodeAt(0), type.charCodeAt(1), type.charCodeAt(2), type.charCodeAt(3)]);
  const crcInput = concatBytes([typeBytes, data]);
  return concatBytes([be32(data.length), crcInput, be32(crc32(crcInput))]);
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(data);
  return copy;
}

function adler32(data: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

/** Valid zlib stream with uncompressed deflate blocks (fallback if CompressionStream is missing). */
function zlibStoreUncompressed(data: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [Uint8Array.of(0x78, 0x01)];
  const max = 65535;
  for (let offset = 0; offset < data.length || offset === 0; offset += max) {
    const slice = data.subarray(offset, Math.min(offset + max, data.length));
    const last = offset + slice.length >= data.length ? 1 : 0;
    const len = slice.length;
    const nlen = ~len & 0xffff;
    const block = new Uint8Array(5 + slice.length);
    block[0] = last;
    block[1] = len & 255;
    block[2] = (len >> 8) & 255;
    block[3] = nlen & 255;
    block[4] = (nlen >> 8) & 255;
    block.set(slice, 5);
    parts.push(block);
    if (last) break;
  }
  parts.push(be32(adler32(data)));
  return concatBytes(parts);
}

async function zlibDeflate(data: Uint8Array): Promise<Uint8Array> {
  if (typeof CompressionStream === "undefined") return zlibStoreUncompressed(data);
  const stream = new Blob([toArrayBuffer(data)]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function encodePng(pixels: Uint8Array, width: number, height: number, colorType: 0 | 2): Promise<Buffer> {
  const channels = colorType === 0 ? 1 : 3;
  if (pixels.length !== width * height * channels) {
    throw new Error("PNG size mismatch");
  }
  const stride = width * channels + 1;
  const raw = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const dest = y * stride;
    raw[dest] = 0;
    raw.set(pixels.subarray(y * width * channels, (y + 1) * width * channels), dest + 1);
  }
  const ihdr = concatBytes([be32(width), be32(height), Uint8Array.of(8, colorType, 0, 0, 0)]);
  const png = concatBytes([
    PNG_SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", await zlibDeflate(raw)),
    chunk("IEND", new Uint8Array()),
  ]);
  return Buffer.from(png);
}

export async function encodePngGrayscale(pixels: Uint8Array, width: number, height: number): Promise<Buffer> {
  return encodePng(pixels, width, height, 0);
}

export async function encodePngRgb(pixels: Uint8Array, width: number, height: number): Promise<Buffer> {
  return encodePng(pixels, width, height, 2);
}

export function looksLikePng(bytes: Uint8Array): boolean {
  return bytes.length > 8 && PNG_SIG.every((b, i) => bytes[i] === b);
}
