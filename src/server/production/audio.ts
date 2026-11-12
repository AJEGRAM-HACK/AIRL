import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import type { z } from 'zod';
import type { Manifest } from './schemas';

const execute = promisify(execFile);
const sampleRate = 22050;
const voices = ['Daniel', 'Samantha', 'Moira'];
const characterVoices: Record<string, string> = { 'captain-bot': 'Fred', 'tita-nena': 'Samantha', 'kuya-taho': 'Daniel' };
const preparing = new Map<string, Promise<Buffer>>();
let queue: Promise<unknown> = Promise.resolve();

function speechSamples(wave: Buffer) {
  if (wave.toString('ascii', 0, 4) !== 'RIFF' || wave.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Invalid speech audio.');
  }
  let samples: Buffer | undefined;
  let validFormat = false;
  for (let offset = 12; offset + 8 <= wave.length;) {
    const size = wave.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > wave.length) throw new Error('Incomplete speech audio.');
    const kind = wave.toString('ascii', offset, offset + 4);
    if (kind === 'fmt ' && size >= 16) {
      validFormat = wave.readUInt16LE(start) === 1 && wave.readUInt16LE(start + 2) === 1 &&
        wave.readUInt32LE(start + 4) === sampleRate && wave.readUInt16LE(start + 14) === 16;
    }
    if (kind === 'data') samples = wave.subarray(start, start + size);
    offset = start + size + size % 2;
  }
  if (!validFormat || !samples?.length || samples.length % 2) throw new Error('Unsupported speech audio.');
  return samples;
}

async function synthesize(manifest: z.infer<typeof Manifest>, destination: string) {
  const temporary = await mkdtemp(join(dirname(destination), '.speech-'));
  try {
    const duration = manifest.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
    const pcm = Buffer.alloc(Math.round(duration * sampleRate) * 2);
    const cast = [...new Set(manifest.scenes.flatMap(scene => scene.dialogue.map(line => line.characterId)))].sort();
    let sceneStart = 0;
    for (const scene of manifest.scenes) {
      const lineDuration = scene.durationSeconds / scene.dialogue.length;
      for (const [index, line] of scene.dialogue.entries()) {
        const textPath = join(temporary, 'line.txt');
        const wavePath = join(temporary, 'line.wav');
        await writeFile(textPath, line.text, { mode: 0o600 });
        const voice = characterVoices[line.characterId] || voices[cast.indexOf(line.characterId) % voices.length];
        await execute('/usr/bin/say', ['-v', voice, '-r', '175', '-o', wavePath,
          '--file-format=WAVE', '--data-format=LEI16@22050', '-f', textPath], { timeout: 15000 });
        const samples = speechSamples(await readFile(wavePath));
        const sourceFrames = samples.length / 2;
        const frames = Math.min(sourceFrames, Math.max(1, Math.floor((lineDuration - 0.08) * sampleRate)));
        const start = Math.round((sceneStart + index * lineDuration) * sampleRate);
        // Fit the complete spoken line inside its existing caption interval.
        for (let frame = 0; frame < frames; frame++) {
          const position = frame * sourceFrames / frames;
          const left = Math.floor(position);
          const right = Math.min(left + 1, sourceFrames - 1);
          const fraction = position - left;
          const value = samples.readInt16LE(left * 2) * (1 - fraction) + samples.readInt16LE(right * 2) * fraction;
          pcm.writeInt16LE(Math.round(value), (start + frame) * 2);
        }
      }
      sceneStart += scene.durationSeconds;
    }
    const header = Buffer.alloc(44);
    header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
    header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36);
    header.writeUInt32LE(pcm.length, 40);
    const wave = Buffer.concat([header, pcm]);
    const ready = join(temporary, 'episode.wav');
    await writeFile(ready, wave, { mode: 0o600 });
    await rename(ready, destination);
    return wave;
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

export async function episodeAudio(manifest: z.infer<typeof Manifest>, databasePath: string) {
  const key = createHash('sha256').update(JSON.stringify({ version: 2, voices, characterVoices, manifest })).digest('hex');
  const directory = join(dirname(databasePath), 'episode-audio');
  const destination = join(directory, `${key}.wav`);
  try { return await readFile(destination); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const existing = preparing.get(destination);
  if (existing) return existing;
  const task = queue.then(async () => {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    return synthesize(manifest, destination);
  });
  preparing.set(destination, task);
  queue = task.catch(() => {});
  try { return await task; }
  finally { preparing.delete(destination); }
}
