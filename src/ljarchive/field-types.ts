import * as leb from '@thi.ng/leb128';
import { Parser } from '../binary-parser.js';
import is from '@sindresorhus/is';


const leb128 = (input: number) => {
  const hex = input.toString(16);
  const ua = fromHexString(hex);
  const big = leb.decodeSLEB128(ua)[0];
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

export const oldLongStr = Parser.start().nest({
  type: Parser.start()
    .uint8('check', { formatter: i => leb128(i) })
    .string('data', { length: 'check' }),
  formatter: v => v.data
});

export const emptyStr = Parser.start();

export const bitMask = Parser.start().bit8('mask').seek(1);

export const timestamp = Parser.start().nest({
  type: Parser.start().uint32be('data', { formatter: t => new Date((t + 946684800) * 1000) }),
  formatter: v => v.data
});

export const undo = Parser.start().seek(-1);

export const optStr = Parser.start().nest({
  type: Parser.start()
    .uint8('fieldType')
    .seek(4)
    .choice('data', {
      tag: 'fieldType',
      choices: {
        6: shortStr,
        9: emptyStr,
        10: emptyStr, // Actually a WTF
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

export const usemask = Parser.start().nest({
  type: Parser.start()
    .uint8('fieldType')
    .choice('data', {
      tag: 'fieldType',
      choices: { 7: shortStr },
      defaultChoice: undo
    }),
  formatter: v => {
    console.log(v);
    return v.data ?? false;
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

export const longStr = Parser.start().useContextVars(true).nest({
  // Check the first two bytes for length.
  // If it's shorter than 255, seek by -1.
  type: Parser.start()
    .uint8('check', { formatter: i => 6 })
    .seek(4)
    .uint16("lookAhead", {
      formatter: u => {
        const ua = fromHexString(u.toString(16));
        return leb.decodeSLEB128(ua);
      }
    }).seek(-1)
    .string('prefix', {
      length: function (data) {
        const lebData = (this as any).lookAhead as [BigInt, Number];
        if (lebData[1] === 2) {
          return 0;
        } else {
          return 1;
        }
      }
    })
    .string('suffix', {
      length: function (data) {
        return Number((this as any).lookAhead[0]);
      }
    }),
  formatter: function (data) {
    const appended = data.prefix + data.suffix;
    return appended;
  }
});