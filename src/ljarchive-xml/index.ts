export * from './xml-file.js';

import { file, schema } from './xml-file.js';

export function parse(input: Buffer) {
  const raw = file.parse(input);
  return schema.parse(raw);
}