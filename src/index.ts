import jetpack from 'fs-jetpack';
import { parseLjArchive } from './ljarchive/parser.js';

let buffer = jetpack.read('./input/archive.lja', 'buffer');

if (buffer) {
  const parsed = parseLjArchive(buffer);
  jetpack.dir('./output').write('livejournal.json', parsed, { jsonIndent: 2 });
}

console.log('done');
