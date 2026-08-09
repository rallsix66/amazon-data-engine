import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function saveRawCapture(input: { asin: string; marketplace: string; html: string; capturedAt?: Date }) {
  const capturedAt = input.capturedAt ?? new Date();
  const directory = process.env.RAW_DATA_DIR ?? 'data/raw';
  await mkdir(directory, { recursive: true });
  const safeTime = capturedAt.toISOString().replace(/[:.]/g, '-');
  const path = join(directory, `${input.marketplace}-${input.asin}-${safeTime}.html`);
  await writeFile(path, input.html, 'utf8');
  return path;
}
