import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

// ---------- OG image: 1200x630 ----------
async function makeOg() {
  const bg = await sharp(resolve(root, "photos/pizza-burratissima.jpg"))
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .modulate({ saturation: 1.1, brightness: 0.92 })
    .toBuffer();

  const overlaySvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0a0604" stop-opacity="0.05"/>
        <stop offset="0.45" stop-color="#0a0604" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#0a0604" stop-opacity="0.92"/>
      </linearGradient>
      <linearGradient id="sun" x1="6" y1="10" x2="26" y2="30" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffb347"/>
        <stop offset="0.55" stop-color="#ff6b3d"/>
        <stop offset="1" stop-color="#a01818"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="630" fill="url(#g)"/>

    <!-- brand mark + name -->
    <g transform="translate(80 430)">
      <g transform="scale(2.4)">
        <circle cx="16" cy="20" r="10" fill="url(#sun)"/>
        <path d="M2 22h28" stroke="#f6ecd9" stroke-width="2" stroke-linecap="round"/>
      </g>
    </g>

    <text x="160" y="475" font-family="Bebas Neue, Arial Narrow, sans-serif" font-size="84" fill="#f6ecd9" letter-spacing="6">TRAMONTO</text>
    <text x="160" y="510" font-family="Inter, Arial, sans-serif" font-size="22" fill="#ff8a3d" letter-spacing="4">LA NAPOLITAINE DE CHOLET</text>

    <text x="80" y="565" font-family="Inter, Arial, sans-serif" font-size="24" fill="#f6ecd9" opacity="0.92">Pizzas napolitaines &#183; P&#226;tes &#183; Gratins</text>
    <text x="80" y="600" font-family="Inter, Arial, sans-serif" font-size="20" fill="#f6ecd9" opacity="0.65">172 rue Nationale, 49300 Cholet &#183; 02 44 09 82 10</text>

    <!-- halal badge -->
    <g transform="translate(1020 60)">
      <rect width="120" height="44" rx="22" fill="#f6ecd9"/>
      <text x="60" y="29" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#0a0604" letter-spacing="2">100% HALAL</text>
    </g>
  </svg>`);

  const out = await sharp(bg)
    .composite([{ input: overlaySvg, top: 0, left: 0 }])
    .jpeg({ quality: 86, progressive: true, mozjpeg: true })
    .toBuffer();

  await writeFile(resolve(root, "og.jpg"), out);
  console.log("og.jpg", out.length, "bytes");
}

// ---------- Icons from favicon.svg ----------
async function makeIcons() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="512" height="512">
    <defs>
      <linearGradient id="s" x1="6" y1="10" x2="26" y2="30" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffb347"/>
        <stop offset="0.55" stop-color="#ff6b3d"/>
        <stop offset="1" stop-color="#a01818"/>
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="7" fill="#0e0907"/>
    <circle cx="16" cy="20" r="9" fill="url(#s)"/>
    <path d="M3 23h26" stroke="#f6ecd9" stroke-width="2" stroke-linecap="round"/>
  </svg>`;

  const sizes = [
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "icon-32.png", size: 32 },
    { name: "icon-16.png", size: 16 },
  ];

  for (const { name, size } of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    await writeFile(resolve(root, name), buf);
    console.log(name, buf.length);
  }

  // Maskable icon: same art on full bleed background (no rounded corners)
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
    <defs>
      <linearGradient id="s" x1="20" y1="35" x2="80" y2="95" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ffb347"/>
        <stop offset="0.55" stop-color="#ff6b3d"/>
        <stop offset="1" stop-color="#a01818"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="#0e0907"/>
    <circle cx="50" cy="58" r="22" fill="url(#s)"/>
    <path d="M16 64h68" stroke="#f6ecd9" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
  const maskBuf = await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toBuffer();
  await writeFile(resolve(root, "icon-maskable-512.png"), maskBuf);
  console.log("icon-maskable-512.png", maskBuf.length);
}

// ---------- WebP versions of every photo ----------
async function makeWebp() {
  const { readdir } = await import("node:fs/promises");
  const dir = resolve(root, "photos");
  const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  for (const f of files) {
    const inPath = resolve(dir, f);
    const outPath = resolve(dir, f.replace(/\.(jpe?g|png)$/i, ".webp"));
    const buf = await sharp(inPath).webp({ quality: 78, effort: 5 }).toBuffer();
    const { writeFile } = await import("node:fs/promises");
    await writeFile(outPath, buf);
    console.log(outPath.replace(root, ""), buf.length, "bytes");
  }
}

await makeOg();
await makeIcons();
await makeWebp();
console.log("done");
