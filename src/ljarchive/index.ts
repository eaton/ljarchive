export * from './file.js';
export * from './schema.js';

import { file } from './file.js';
import { LjArchiveFile, schema } from './schema.js';

export function parse(input: Buffer) {
  const raw = file.parse(input);
  return schema.parse(raw) as LjArchiveFile;
}