import { Parser } from '../binary-parser.js';

const DOTNET_EPOCH_OFFSET = 856799194;

const varString = Parser.start().useContextVars(true).nest({
  type: Parser.start()
    .uint16('check', { assert: 65279 })
    .seek(1)
    .uint8('rawLength')
    .choice('length', {
      tag: 'rawLength',
      choices: {
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
    })
    .string('string', { length: 'length' }),
  formatter: function (data) {
    return data.string;
  }
});

export const timestamp = Parser.start().nest({
  type: Parser.start().uint32be('data', { formatter: (t) => new Date((t + DOTNET_EPOCH_OFFSET) * 1000) }),
  formatter: v => v.data
});

export function parseSemagicFile(input: Buffer) {
  const entry = Parser.start()
    .endianess('little')
    .uint16('check', { assert: 65535 })
    .int32("Header")
    .string("TypeCode", { length: 10 })
    .array("Unknown", { type: varString, length: 11 })
    .int32("EntryID")
    .int32("Unknown")
    .nest("Handle", { type: varString })
    .nest("DisplayName", { type: varString })
    .nest("Body", { type: varString })
    .nest("Subject", { type: varString })
    .nest("Date", { type: timestamp })
    .int32("Unknown")
    .int32("Unknown")
    .int32("Unknown")
    .nest("Music", { type: varString })
    .nest("Mood", { type: varString })
    .int32("Unknown")
    .nest("User Picture", { type: varString })
  return entry;
}
