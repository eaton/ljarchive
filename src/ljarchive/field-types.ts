import * as leb from '@thi.ng/leb128';
import { Parser } from '../binary-parser.js';
import is from '@sindresorhus/is';

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
  formatter: v => v.data,
});

export const longStr = Parser.start().nest({
  type: Parser.start()
    .uint16('length', { formatter: i => leb128(i) })
    .string('data', { length: 'length' }),
  formatter: v => v.data
});

export const emptyStr = Parser.start();

export const bitMask = Parser.start().bit8('mask').seek(1);

export const timestamp = Parser.start().nest({
  type: Parser.start().uint32be('data', { formatter: t => new Date((t + 946684800) * 1000) }),
  formatter: v => v.data
});

export const undo = Parser.start().seek(-1);

export const usemask = Parser.start().nest({
  type: Parser.start()
    .uint8('fieldType')
    .seek(-1)
    .choice('data', {
      tag: 'fieldType',
      choices: { 7: shortStr },
      defaultChoice: emptyStr
    }),
  formatter: v => {
    console.log(v);
    return v.data ?? false;
  }
});


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
        9: emptyStr,
      },
    }),
  formatter: v => {
    if (is.emptyObject(v.data)) {
      return '';
    } else {
      return v.data;
    }
  }
});

export const optStr = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint8('fieldType')
    .seek(2)
    .choice('data', {
      tag: 'fieldType',
      choices: {
        6: Parser.start().seek(2).nest({ type: shortStr }),
        9: Parser.start().seek(2).nest({ type: emptyStr }),
        10: Parser.start().seek(5).nest({ type: shortStr }), // Actually a WTF
      },
    }),
  formatter: v => {
    if (is.emptyObject(v.data)) {
      return '';
    } else {
      return v.data;
    }
  }
});

export const anyField = Parser.start().nest({
  type: Parser.start()
    .uint8('fieldType')
    .choice('data', {
      tag: 'fieldType',
      choices: {
        7: shortStr,
        8: bitMask,  // bitmask field
        9: emptyStr, // Empty variable-length field
      },
    }),
  formatter: v => v.data,
});

