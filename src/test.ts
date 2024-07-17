import * as leb from '@thi.ng/leb128';

console.log(leb.decodeSLEB128(new Uint8Array([50, 105])));