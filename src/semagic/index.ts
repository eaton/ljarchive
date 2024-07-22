export * from './file.js';
export * from './schema.js';

import { file } from './file.js';
import { schema, SemagicFile } from './schema.js';

export function parse(input: Buffer): SemagicFile {
  const raw = file.parse(input);
  return schema.parse(raw);
}