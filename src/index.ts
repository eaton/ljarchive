import jetpack from 'fs-jetpack';
import { parseLjArchive } from './ljarchive/parse.js';

let buffer = jetpack.read('./input/archive.lja', 'buffer');

if (buffer) {
  const parsed = parseLjArchive(buffer);
  // console.log(parsed.events.map((e: any) => ({ subj: e.Subject, music: e.Music })));
}

console.log('done');
