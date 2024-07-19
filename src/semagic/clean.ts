import { Parser } from '../binary-parser.js';

const varString = Parser.start().useContextVars(true).nest({
  type: Parser.start()
    .uint16('check', { assert: 65279 })
    .seek(1)
    .uint8('lengthLength')
    .choice('data', {
      tag: 'lengthLength',
      choices: {
        0: Parser.start(),
        255: Parser.start().nest({
          type: Parser.start()
            .uint16('length')
            .string('data', { length: 'length' })
        }),
      },
      defaultChoice: Parser.start().nest({
          type: Parser.start().seek(-1)
            .uint8('length')
            .string('data', { length: 'length' })
        }),
    }),
    formatter: v => v.data || undefined,
});

export function parseSemagicFile(input: Buffer) {
  const entry = Parser.start()
    .endianess('little')
    .uint16('check', { assert: 65535 })
    .int32("Header")
  return entry;
}
