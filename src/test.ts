const ticksPerMillisecond = 10000n
const epochTicks = 621355968000000000n;
                238876971770875610438n
const e1 = {
  seconds: 991709100,
  ticks: '0D00A689D6ADBCC2',
}

const e2 = {
  seconds: 991856460,
  ticks: '0D001622BD56BBC208',
}
const diff = e2.seconds - e1.seconds;

console.log(e1.ticks)
console.log(Number.parseInt(e1.ticks, 16))