import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, "../build");
const pngPath = path.join(buildDir, "icon.png");
const icoPath = path.join(buildDir, "icon.ico");

mkdirSync(buildDir, { recursive: true });

const size = 512;
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#09090b"/>
  <rect x="10" y="10" width="492" height="492" rx="102" fill="none" stroke="#8b5cf6" stroke-opacity="0.4" stroke-width="12"/>
  <text x="256" y="300" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="280" font-weight="700" fill="#8b5cf6" letter-spacing="-12">N</text>
  <circle cx="400" cy="112" r="36" fill="#ef4444"/>
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile(pngPath);

const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngBuffers = await Promise.all(
  sizes.map((s) =>
    sharp(pngPath)
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer(),
  ),
);

const ico = await pngToIco(pngBuffers);
writeFileSync(icoPath, ico);

console.log(`Wrote ${pngPath}`);
console.log(`Wrote ${icoPath}`);
