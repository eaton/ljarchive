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
    .buffer('data', {
      length: 4, formatter: (b: Buffer) => {
        const hex = b.toString('hex');
        return hex.length ? hex : undefined;
      }
    }),
  formatter: i => {
    if ((i.data === undefined) || (i.data === '00000000')) {
      return undefined;
    } else {
      return i.data;
    }
  }
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

/**
 * Every string written into the file carries an object id, and .NET's
 * BinaryFormatter writes a repeated value only once: later fields holding the
 * same string are a MemberReference pointing back at that id. Resolving those
 * needs a table of what has been seen so far.
 *
 * Cleared at the start of each parse. It is module state, which is not lovely,
 * but the generated parser has no way to thread a table through nested field
 * definitions.
 */
const strings = new Map<number, string>();

export function resetStringTable() {
  strings.clear();
}

/**
 * An optional string field, in one of the two forms BinaryFormatter uses:
 *
 *   6  BinaryObjectString  the string itself, with the id being defined
 *   9  MemberReference     an id pointing at a string written earlier
 *
 * Treating a reference as absent silently drops real values. It is easy to
 * miss because the fields people check first look fine: bodies and subjects
 * are mostly written inline, and the references among them nearly all point at
 * the interned empty string, so an absent value is the right answer by
 * accident. Columns holding a short repeated value are where it shows — in one
 * real archive the comment table's third column resolved for 3 of 4129 rows
 * without this, and all 4129 with it.
 */
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
    // A reference: fieldID names the string, and the parsed data is empty.
    if (v.fieldType === 9) {
      return strings.get(v.fieldID);
    }
    if (is.emptyObject(v.data)) {
      return undefined;
    }
    // An inline string: fieldID is the id this value is being given, so
    // remember it for the references that follow.
    if (typeof v.data === 'string') {
      strings.set(v.fieldID, v.data);
    }
    return v.data;
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
