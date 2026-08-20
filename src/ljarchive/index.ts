export * from './file.js';
export * from './schema.js';

import { file } from './file.js';
import { resetStringTable } from './fields.js';
import { LjArchiveFile, schema } from './schema.js';

export function parse(input: Buffer) {
  // String ids restart with every file.
  resetStringTable();
  const raw = file.parse(input);
  return schema.parse(raw) as LjArchiveFile;
}