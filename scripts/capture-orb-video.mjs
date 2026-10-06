import { chromium } from 'playwright';
import { mkdir, writeFile, rm } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const framesDir = path.join(root, '.orb-frames');
const outVideo = path.join(root, 'public/video/orb.mp4');
const orbHtml = path.join(root, 'scripts/orb-capture.html');

const CAPTURE_SIZE = 440;
const FPS = 30;
const DURATION_SEC = 4;
const FRAME_COUNT = FPS * DURATION_SEC;

await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--enable-webgl'],
});
const page = await browser.newPage({
  viewport: { width: CAPTURE_SIZE, height: CAPTURE_SIZE },
});
await page.goto(`file://${orbHtml}`, { waitUntil: 'load' });
await page.waitForTimeout(1500);

for (let i = 0; i < FRAME_COUNT; i++) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.getElementById('orb');
    return canvas.toDataURL('image/png');
  });
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const framePath = path.join(framesDir, `frame-${String(i).padStart(4, '0')}.png`);
  await writeFile(framePath, Buffer.from(base64, 'base64'));
  await page.waitForTimeout(1000 / FPS);
}

await browser.close();

execSync(
  `ffmpeg -y -framerate ${FPS} -i "${framesDir}/frame-%04d.png" -c:v libx264 -pix_fmt yuv420p -crf 20 "${outVideo}"`,
  { stdio: 'inherit' }
);

await rm(framesDir, { recursive: true, force: true });
console.log(`Wrote ${outVideo}`);
