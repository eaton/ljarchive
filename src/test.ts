import * as leb from '@thi.ng/leb128';

console.log(leb.decodeULEB128(new Uint8Array([157, 15])));