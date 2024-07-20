export function ticksToDate(input: number | string | bigint | string) {
  const epochTicks = 621355968000000000n;
  const ticksPerMillisecond = 10000n; // whoa!
  const maxDateMilliseconds = 8640000000000000n; // via http://ecma-international.org/ecma-262/5.1/#sec-15.9.1.1

  const ticks: bigint = BigInt(input);

  // convert the ticks into something javascript understands
  const ticksSinceEpoch = ticks - epochTicks;
  const millisecondsSinceEpoch = ticksSinceEpoch / ticksPerMillisecond;

  if (millisecondsSinceEpoch > maxDateMilliseconds) {
    //      +035210-09-17T07:18:31.111Z
    throw new Error('Result exceeds max Date');
  }

  // output the result in something the human understands
  if (millisecondsSinceEpoch === 0n) return undefined;
  return new Date(Number(millisecondsSinceEpoch));
};