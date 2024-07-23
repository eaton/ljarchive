import is from '@sindresorhus/is';
import * as leb from '@thi.ng/leb128';
import { Parser } from '../binary-parser.js';
import { ticksToDate } from './ticks-to-date.js';

export const bool = Parser.start().nest({
  type: Parser.start()
    .uint16le('type', { assert: 264 })
    .uint8('data', { formatter: (i) => !!i }),
  formatter: v => v.data
});

export const bitmask = Parser.start().nest({
  type: Parser.start()
    .uint16le('type', { assert: 2056 })
    .buffer('data', { length: 3, formatter: (b: Buffer) => b.toString('binary')})
})

export const entityIdField = Parser.start().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .uint32le('data'),
  formatter: i => i.data || undefined
})

export const timestamp = Parser.start().nest({
  type: Parser.start()
    .uint16le('type', { assert: 3336 })
    .uint64le('data', { formatter: (t) => t === 0n ? undefined :  ticksToDate(t) }),
  formatter: v => v.data
});

export const varStr = Parser.start().useContextVars(true).nest({
  type: Parser.start()
    // We look ahead four bytes, using ULEB decoding to figure out
    // how many bytes contain length data versus string data. Then,
    // We back up by the number of bytes we 'overshot.'
    .buffer("offset", {
      length: 3,
      formatter: (b: Buffer) => leb.decodeULEB128(new Uint8Array(b))
    })
    .seek(function(...args) {
      // @ts-ignore
      const offset = (this as any).offset[1] - 3;
      return offset;
    })

    // …And finally parse the string data itself.
    .string('string', {
      length: function () {
        // @ts-ignore
        const length = Number((this as any).offset[0]);
        return length;
      }
    }),
  formatter: function (data) {
    return data.string || undefined;
  }
});

export const optStr = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint8('fieldType', { assert: t => t === 6 || t === 9})
    .uint32le('fieldID')
    .choice('data', {
      tag: 'fieldType',
      choices: {
        6: Parser.start().nest({ type: varStr }),
        9: Parser.start(),
      },
    }),
  formatter: v => {
    if (is.emptyObject(v.data)) {
      return undefined;
    } else {
      return v.data;
    }
  }
});

export const recordCount = Parser.start().nest({
  type: Parser.start()
    .int8('marker')
    .int8('id')
    .int32le('unknown1')
    .int32le('unknown2')
    .int32le('length')
    .seek(1)
    .array('spacers', { type: optStr, length: 'length' }),
  formatter: data => (data as { length: number }).length
});

export const recordHeader = Parser.start().nest({
  type: Parser.start()
    .uint8("marker", { assert: 16 })
    .uint32le("recordId")
    .uint32le("fieldCount"),
  formatter: () => ({})
})
