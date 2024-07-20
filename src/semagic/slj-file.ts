import { Parser } from '../binary-parser.js';

const DOTNET_EPOCH_OFFSET = 856799194;

const varString = Parser.start().nest({
  type: Parser.start()
    .uint16le('mark') // , { assert: 65279 }
    .seek(1)
    .uint8('length', { formatter: l => l * 2 })
    .choice('data', {
      tag: 'length',
      choices: {
        510: Parser.start().nest({
          type: Parser.start()
            .uint16le('length', { formatter: l => l * 2 })
            .string('string', { length: 'length', encoding: 'utf-16le' })
        }),
        0: Parser.start()
      },
      defaultChoice: Parser.start().nest({
        type: Parser.start()
          .seek(-1)
          .uint8('length', { formatter: l => l * 2 })
          .string('string', { length: 'length', encoding: 'utf-16le' })
      }),
    }),
  formatter: d => d.data?.string || undefined
});

export const timestamp = Parser.start().nest({
  type: Parser.start().uint32le('data', { formatter: t => new Date(t * 1000) }),
  formatter: v => v.data
});

export const sljFile = Parser.start()
  .endianess('little')
  .uint16le('check1', { assert: 65535 })
  .uint16le("check2", { assert: 8 })
  .uint16le("check3", { assert: 6 })
  .string("typeCode", { length: 10, stripNull: true, assert: 'CEntry' })
  .array("unknownStrings", { type: varString, length: 11 })
  .int32le("id")
  .int32le("unknown1")
  .nest("userName", { type: varString })
  .nest("fullName", { type: varString })
  .nest("body", { type: varString })
  .nest("subject", { type: varString })
  .int32le("unknown2")
  .int32le("unknown3")
  .nest("date", { type: timestamp })
  .int32le("unknown4")
  .nest("music", { type: varString })
  .nest("mood", { type: varString })
  .int32le("moodId")
  .nest("userPic", { type: varString })

