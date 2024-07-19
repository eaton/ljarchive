import * as leb from '@thi.ng/leb128';
import { Parser } from '../binary-parser.js';
import is from '@sindresorhus/is';
import { ticksToDate } from './ticks-to-datestring.js';
const DOTNET_EPOCH_OFFSET = 856799194;

const leb128 = (input: number) => {
  const hex = input.toString(16);
  const ua = fromHexString(hex);
  const big = leb.decodeULEB128(ua)[0];
  return Number(big);
};

const fromHexString = (hexString: string) =>
  Uint8Array.from(
    hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? [],
  );

export const shortStr = Parser.start().nest({
  type: Parser.start().uint8('length').string('data', { length: 'length' }),
  formatter: v => v.data || undefined,
});

export const emptyStr = Parser.start();

export const bool = Parser.start().bit8('mask', { formatter: m => m.mask === 1 }).seek(1);

export const bitMask16 = Parser.start().bit16('mask');

export const entityIdField = Parser.start().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .uint32le('data'),
  formatter: i => i.data || undefined
})

export const timestamp = Parser.start().nest({
  type: Parser.start()
    .uint16le('type', { assert: 3336 })
    .uint64le('data', { formatter: (t) => ticksToDate(t) }),
  formatter: v => v.data
});

export const undo = Parser.start().seek(-1);

export const varString = Parser.start().useContextVars(true).nest({
  type: Parser.start()
    .uint8('check', { assert: 6 })

    // This is occasionally useful for debugging, but we discard it
    // when formatting the final result.
    .uint32le("id")

    // We look ahead four bytes, using ULEB decoding to figure out
    // how many bytes contain length data versus string data.
    .buffer("offset", {
      length: 4,
      formatter: (b: Buffer) => leb.decodeULEB128(new Uint8Array(b))
    })

    // We back up by however much we overshot the 'length bytes'
    .seek(function(...args) {
      // @ts-ignore
      const offset = (this as any).offset[1] - 4;
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
    return data.string;
  }
});

export const optVarStr = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint8('fieldType').seek(-1)
    .choice('data', {
      tag: 'fieldType',
      choices: {
        6: varString,
        9: Parser.start().seek(5),
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

export const cBody = optVarStr;


export const nullable = Parser.start().nest({
  type: Parser.start()
    .uint8('fieldType')
    .choice('data', {
      tag: 'fieldType',
      choices: {
        6: Parser.start().seek(4).nest({ type: shortStr }),
        7: shortStr,
        8: bool,  // bitmask field
        9: Parser.start().seek(4), // Empty variable-length field
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

