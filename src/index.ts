import jetpack from 'fs-jetpack';
import { ljaFile } from './ljarchive/lja-file.js';
import { sljFile } from './semagic/slj-file.js';

let sljBuffer = jetpack.read('./input/semagic.slj', 'buffer');
if (sljBuffer) {
  const parsed = sljFile.parse(sljBuffer);
  jetpack.dir('./output').write('semagic.json', parsed, { jsonIndent: 2 });
}

let ljaBuffer = jetpack.read('./input/archive.lja', 'buffer');
if (ljaBuffer) {
  const parsed = ljaFile.parse(ljaBuffer);
  jetpack.dir('./output').write('ljarchive.json', parsed, { jsonIndent: 2 });
}

console.log('done');
