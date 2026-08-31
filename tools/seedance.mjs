#!/usr/bin/env node
// Generate video with ByteDance Seedance 2.0 via fal.ai (queue API, no SDK).
//
// Usage:
//   node tools/seedance.mjs "prompt text" [options]
//
// Options:
//   --image <url-or-path>   image-to-video (local files sent as data URIs)
//   --fast                  use the cheaper/faster fast variant
//   --resolution <r>        480p | 720p (default) | 1080p | 4k
//   --duration <s>          auto (default) | 4..15 seconds
//   --aspect <a>            auto | 21:9 | 16:9 | 4:3 | 1:1 | 3:4 | 9:16 (default 9:16)
//   --no-audio              disable native audio generation
//   --out <file>            output path (default out/seedance-<timestamp>.mp4)
//
// Requires FAL_KEY in the environment (get one at https://fal.ai/dashboard/keys).

import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {basename, dirname, extname, resolve} from 'node:path';

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('FAL_KEY is not set. Create a key at https://fal.ai/dashboard/keys and export FAL_KEY=...');
  process.exit(1);
}

const args = process.argv.slice(2);
const prompt = args.find((a) => !a.startsWith('--'));
if (!prompt) {
  console.error('Usage: node tools/seedance.mjs "prompt" [--image <url-or-path>] [--fast] [--resolution 720p] [--duration auto] [--aspect 9:16] [--no-audio] [--out file.mp4]');
  process.exit(1);
}
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const has = (name) => args.includes(`--${name}`);

const image = opt('image');
const fast = has('fast');
const mode = image ? 'image-to-video' : 'text-to-video';
const model = `bytedance/seedance-2.0/${fast ? 'fast/' : ''}${mode}`;

const input = {
  prompt,
  resolution: opt('resolution', '720p'),
  duration: opt('duration', 'auto'),
  aspect_ratio: opt('aspect', '9:16'),
  generate_audio: !has('no-audio'),
  bitrate_mode: opt('bitrate', 'standard'),
};
if (image) {
  if (/^https?:\/\//.test(image)) {
    input.image_url = image;
  } else {
    const buf = readFileSync(resolve(image));
    const mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}[extname(image).toLowerCase()] ?? 'image/png';
    input.image_url = `data:${mime};base64,${buf.toString('base64')}`;
  }
}

const headers = {Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json'};
const api = async (url, init) => {
  const res = await fetch(url, {headers, ...init});
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${url} -> ${res.status}: ${await res.text()}`);
  return res.json();
};

console.log(`model: ${model}`);
console.log(`input: ${JSON.stringify({...input, image_url: image ? '<image>' : undefined})}`);

const job = await api(`https://queue.fal.run/${model}`, {method: 'POST', body: JSON.stringify(input)});
console.log(`queued: ${job.request_id}`);

let status;
do {
  await new Promise((r) => setTimeout(r, 5000));
  status = await api(`${job.status_url}?logs=0`);
  process.stdout.write(`\rstatus: ${status.status}${status.queue_position != null ? ` (queue ${status.queue_position})` : ''}   `);
} while (status.status === 'IN_QUEUE' || status.status === 'IN_PROGRESS');
console.log();

if (status.status !== 'COMPLETED') throw new Error(`generation failed: ${JSON.stringify(status)}`);

const result = await api(job.response_url);
const videoUrl = result.video?.url;
if (!videoUrl) throw new Error(`no video in result: ${JSON.stringify(result)}`);

const out = opt('out', `out/seedance-${Date.now()}.mp4`);
mkdirSync(dirname(resolve(out)), {recursive: true});
const video = await fetch(videoUrl);
writeFileSync(resolve(out), Buffer.from(await video.arrayBuffer()));
console.log(`saved ${out} (seed ${result.seed})`);
