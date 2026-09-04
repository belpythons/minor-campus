/**
 * Generates every PWA icon size from public/logo.png.
 *   node scripts/generate-pwa-icons.mjs
 *
 * Maskable icons need ~20% safe padding on each side, otherwise Android
 * crops into the STITEK mark when it applies its own shape mask.
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/logo.png";
const OUT = "public/icons";
mkdirSync(OUT, { recursive: true });

/** Brand navy — matches theme-color so the splash screen has no seam. */
const BG = { r: 10, g: 42, b: 94, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * The source logo is a crest stacked above a "STITEK" wordmark. A circular
 * mask throws the wordmark away and its dark blue has too little contrast on
 * navy anyway, so maskable icons use `crestOnly` to keep just the crest.
 */
const CREST = { left: 50, top: 15, width: 140, height: 140 };

async function square(size, { padRatio, background, name, crestOnly = false }) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const base = crestOnly ? sharp(SRC).extract(CREST) : sharp(SRC);
  const logo = await base
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const offset = Math.round((size - inner) / 2);

  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(`${OUT}/${name}`);

  console.log(name, `${size}x${size}`);
}

// Standard icons — white ground so the logo reads on any launcher.
await square(192, { padRatio: 0.08, background: WHITE, name: "icon-192.png" });
await square(512, { padRatio: 0.08, background: WHITE, name: "icon-512.png" });

// Maskable — navy ground, generous padding for the safe zone.
await square(192, { padRatio: 0.2, background: BG, name: "maskable-192.png", crestOnly: true });
await square(512, { padRatio: 0.2, background: BG, name: "maskable-512.png", crestOnly: true });

// iOS home screen (no transparency allowed).
await square(180, { padRatio: 0.1, background: WHITE, name: "apple-touch-icon.png" });

// Favicons.
await square(32, { padRatio: 0.04, background: WHITE, name: "favicon-32.png" });
await square(16, { padRatio: 0.02, background: WHITE, name: "favicon-16.png" });
