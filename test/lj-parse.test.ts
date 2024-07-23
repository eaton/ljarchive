import test from 'ava';
import jetpack from "fs-jetpack";
import { lja } from '../src/index.js'


const file = './input/archive.lja';

test('parse lja file', t => {
  const b = jetpack.read(file, 'buffer');
  t.not(b, undefined);
  t.notThrows(() => lja.file.parse(b!));
});