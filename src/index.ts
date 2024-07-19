import jetpack from 'fs-jetpack';
import { parseLjArchive } from './ljarchive/parse.js';

let buffer = jetpack.read('./input/archive.lja', 'buffer');

if (buffer) {
  const parsed = parseLjArchive(buffer);
  jetpack.dir('./output').write('livejournal.json', parsed, { jsonIndent: 2 });
}

console.log('done');
