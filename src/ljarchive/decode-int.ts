function decodeVarint(uint8Array: Uint8Array, pos: number): number {
  let start = pos;
  let number = 0;
  let byte = 128;
  let shift = 0;

  while (byte & 0x80) {
    if (pos >= uint8Array.length) {
      throw new Error('Unexpected end of byte array');
    }
    byte = uint8Array[pos];
    pos++;
    number += (byte & 127) << shift;
    shift += 7;
  }

  return number;
}
