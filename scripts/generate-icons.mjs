#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import ico from "sharp-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const iconsDir = path.join(rootDir, "public", "icons");
const appDir = path.join(rootDir, "src", "app");

const variants = [
  {
    source: "huntscope-mark-simple.svg",
    outputs: [
      { file: "favicon-16.png", size: 16 },
      { file: "favicon-32.png", size: 32 },
    ],
  },
  {
    source: "huntscope-mark.svg",
    outputs: [
      { file: "icon-192.png", size: 192 },
      { file: "icon-512.png", size: 512 },
      { file: "../../src/app/apple-icon.png", size: 180 },
      { file: "../../src/app/icon.png", size: 32 },
    ],
  },
  {
    source: "huntscope-mark-maskable.svg",
    outputs: [{ file: "icon-maskable-512.png", size: 512 }],
  },
];

async function renderSvgToPng(svgPath, size) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: Math.max(96, Math.ceil(size * 2)) })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  for (const variant of variants) {
    const sourcePath = path.join(iconsDir, variant.source);

    for (const output of variant.outputs) {
      const outputPath = path.resolve(iconsDir, output.file);
      await mkdir(path.dirname(outputPath), { recursive: true });
      const png = await renderSvgToPng(sourcePath, output.size);
      await writeFile(outputPath, png);
      console.log(`Wrote ${path.relative(rootDir, outputPath)} (${output.size}px)`);
    }
  }

  const favicon16 = await renderSvgToPng(
    path.join(iconsDir, "huntscope-mark-simple.svg"),
    16,
  );
  const favicon32 = await renderSvgToPng(
    path.join(iconsDir, "huntscope-mark-simple.svg"),
    32,
  );

  await ico.sharpsToIco([sharp(favicon16), sharp(favicon32)], path.join(appDir, "favicon.ico"));
  console.log("Wrote src/app/favicon.ico");

  await writeFile(path.join(iconsDir, "icon.svg"), await readFile(path.join(iconsDir, "huntscope-mark.svg")));
  console.log("Synced public/icons/icon.svg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
