/**
 * Prints both official documents to PDF through a real browser, so the saved
 * file is exactly what a user would get from Cetak / Simpan PDF.
 * Usage: node scripts/_pdf.mjs <outDir> [baseUrl]
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = process.argv[2];
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1360, height: 900 });

await page.goto(`${base}/login`, { waitUntil: "networkidle2" });
await page.type('input[type="email"]', "belva.test@stitek.local");
await page.type('input[type="password"]', "Test1234!");
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2" }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await new Promise((r) => setTimeout(r, 1500));

// Exercise the dark theme too: the print sheet must ignore it entirely.
for (const theme of ["light", "dark"]) {
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }]);
  await page.evaluate((t) => localStorage.setItem("theme", t), theme);

  for (const [slug, path] of [
    ["formulir2", "/print/formulir2"],
    ["rekap-magang", "/print/rekap-magang?dari=&sampai=&kategori=&foto=1&komentar=1"],
  ]) {
    await page.goto(base + path, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 800));

    await page.pdf({
      path: `${outDir}/${slug}-${theme}.pdf`,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log("pdf", `${slug}-${theme}`);
  }
}

await browser.close();
