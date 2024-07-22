export * from './xml-file.js';

import { file, LjXmlFile, schema } from './xml-file.js';

export function parse(input: Buffer): LjXmlFile {
  const raw = file.parse(input);
  return schema.parse(raw);
}