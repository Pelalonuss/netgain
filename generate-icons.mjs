/**
 * Generates 192x192 and 512x512 PNG icons for the PWA
 * Run with: node generate-icons.mjs
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';

// ─── CRC32 ────────────────────────────────────────────────────────────────────
function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
}
const CRC_TABLE = makeCRCTable();
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

function createPNG(size) {
  const W = size, H = size;

  // ─── Draw icon ─────────────────────────────────────────────────────────────
  // RGBA pixel array
  const pixels = new Uint8Array(W * H * 4);

  const setPixel = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const off = (y * W + x) * 4;
    pixels[off] = r; pixels[off + 1] = g; pixels[off + 2] = b; pixels[off + 3] = a;
  };

  const fillRect = (x1, y1, x2, y2, r, g, b, a = 255) => {
    for (let y = y1; y <= y2; y++)
      for (let x = x1; x <= x2; x++)
        setPixel(x, y, r, g, b, a);
  };

  const drawCircle = (cx, cy, radius, r, g, b, fill = false) => {
    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (fill ? dist <= radius : Math.abs(dist - radius) < 1.5)
          setPixel(x, y, r, g, b);
      }
    }
  };

  const s = size / 512; // scale factor

  // Background: black with slight rounding indicator
  fillRect(0, 0, W - 1, H - 1, 0, 0, 0);

  // Outer border rect (rounded look via thick border)
  const bOff = Math.round(16 * s);
  for (let t = 0; t < Math.round(3 * s); t++) {
    for (let x = bOff + t; x < W - bOff - t; x++) {
      setPixel(x, bOff + t, 243, 230, 0);
      setPixel(x, H - bOff - t - 1, 243, 230, 0);
    }
    for (let y = bOff + t; y < H - bOff - t; y++) {
      setPixel(bOff + t, y, 243, 230, 0);
      setPixel(W - bOff - t - 1, y, 243, 230, 0);
    }
  }

  // Corner brackets - top left
  const cOff = Math.round(16 * s);
  const cLen = Math.round(84 * s);
  const cThick = Math.round(6 * s);
  // TL
  fillRect(cOff, cOff, cOff + cLen, cOff + cThick - 1, 243, 230, 0); // horizontal
  fillRect(cOff, cOff, cOff + cThick - 1, cOff + cLen, 243, 230, 0); // vertical
  // TR
  fillRect(W - cOff - cLen - 1, cOff, W - cOff - 1, cOff + cThick - 1, 243, 230, 0);
  fillRect(W - cOff - cThick, cOff, W - cOff - 1, cOff + cLen, 243, 230, 0);
  // BL
  fillRect(cOff, H - cOff - cThick, cOff + cLen, H - cOff - 1, 243, 230, 0);
  fillRect(cOff, H - cOff - cLen - 1, cOff + cThick - 1, H - cOff - 1, 243, 230, 0);
  // BR
  fillRect(W - cOff - cLen - 1, H - cOff - cThick, W - cOff - 1, H - cOff - 1, 243, 230, 0);
  fillRect(W - cOff - cThick, H - cOff - cLen - 1, W - cOff - 1, H - cOff - 1, 243, 230, 0);

  // Dumbbell
  const dbY = Math.round(220 * s);
  const dbH = Math.round(72 * s);
  const barY = Math.round(248 * s);
  const barH = Math.round(16 * s);

  // Left weight block
  const lx1 = Math.round(60 * s), lx2 = Math.round(110 * s);
  fillRect(lx1, dbY, lx2, dbY + dbH + Math.round(36 * s), 243, 230, 0); // inner plate
  fillRect(Math.round(48 * s), dbY + Math.round(18 * s), Math.round(122 * s), dbY + dbH + Math.round(18 * s), 243, 230, 0); // outer plate

  // Right weight block
  const rx1 = Math.round(400 * s), rx2 = Math.round(452 * s);
  fillRect(rx1, dbY, rx2, dbY + dbH + Math.round(36 * s), 243, 230, 0);
  fillRect(Math.round(390 * s), dbY + Math.round(18 * s), Math.round(464 * s), dbY + dbH + Math.round(18 * s), 243, 230, 0);

  // Bar
  fillRect(Math.round(110 * s), barY, Math.round(400 * s), barY + barH, 243, 230, 0);

  // Text "CG" rendered as pixel art (scaled)
  const textY = Math.round(360 * s);
  // Draw "C" shape
  const tS = Math.round(6 * s);
  const cx1 = Math.round(150 * s);
  const cx2 = Math.round(230 * s);
  // C - top
  fillRect(cx1, textY, cx2, textY + tS, 243, 230, 0);
  // C - bottom
  fillRect(cx1, textY + Math.round(50 * s), cx2, textY + Math.round(50 * s) + tS, 243, 230, 0);
  // C - left
  fillRect(cx1, textY, cx1 + tS, textY + Math.round(55 * s), 243, 230, 0);

  // G
  const gx1 = Math.round(260 * s);
  const gx2 = Math.round(360 * s);
  fillRect(gx1, textY, gx2, textY + tS, 243, 230, 0); // top
  fillRect(gx1, textY + Math.round(50 * s), gx2, textY + Math.round(50 * s) + tS, 243, 230, 0); // bottom
  fillRect(gx1, textY, gx1 + tS, textY + Math.round(55 * s), 243, 230, 0); // left
  fillRect(gx2 - tS, textY + Math.round(25 * s), gx2, textY + Math.round(55 * s), 243, 230, 0); // right bottom
  fillRect(Math.round(310 * s), textY + Math.round(25 * s), gx2, textY + Math.round(25 * s) + tS, 243, 230, 0); // middle right

  // Center dot
  drawCircle(Math.round(256 * s), Math.round(120 * s), Math.round(8 * s), 243, 230, 0, true);

  // ─── Build PNG ──────────────────────────────────────────────────────────────
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (we'll add filter bytes and convert to 3-channel)
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Use RGBA color type = 6
  ihdr[9] = 6;

  // IDAT: filter + raw pixels
  const scanlines = [];
  for (let y = 0; y < H; y++) {
    scanlines.push(0); // filter type None
    for (let x = 0; x < W; x++) {
      const off = (y * W + x) * 4;
      scanlines.push(pixels[off], pixels[off + 1], pixels[off + 2], pixels[off + 3]);
    }
  }
  const rawData = Buffer.from(scanlines);
  const compressed = deflateSync(rawData, { level: 6 });

  const png = Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);

  return png;
}

const sizes = [192, 512];
for (const size of sizes) {
  const png = createPNG(size);
  const path = `public/icon-${size}.png`;
  writeFileSync(path, png);
  console.log(`✓ Generated ${path} (${png.length} bytes)`);
}
console.log('\n✓ Icons generated! Run "npm run build" again to include them in the PWA.');
