// The stranding scene is shared by every route and one of its lines is the desert's:
// air conditioning losing to heat. On the Oregon coast in fog that is backwards, and in
// the Delta the air was never cool to begin with. One line per climate; the rest of the
// scene is weather-free and stays as it is.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'mile-marker-v2.html');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const from = `    text: [
      "The engine doesn't announce it. It just stops pulling.",
      "You coast as far as the shoulder gives you and then you're a parked car in a place nobody parks.",
      "The vents keep moving air that stopped being cold a while ago.",`.replace(/\n/g, NL);
const to = `    textFn: (s) => [
      "The engine doesn't announce it. It just stops pulling.",
      "You coast as far as the shoulder gives you and then you're a parked car in a place nobody parks.",
      // The one line in this scene that has weather in it, so it has to be the route's.
      R().id === 'coast' ? "With the fan off the windows start to fog from the inside, and in a minute you cannot see the road you are parked beside."
        : R().id === 'south' ? "The vents keep moving air that was never cool to begin with."
        : "The vents keep moving air that stopped being cold a while ago.",`.replace(/\n/g, NL);
if (src.split(from).length - 1 !== 1) { console.error('ANCHOR MISSING: strand weather'); process.exit(1); }
src = src.replace(from, to);
// The array this replaced closed with "]," — textFn's array closes the same way, so the
// rest of the node is untouched.
const from2 = "const BUILD = '2026-10-20.1';", to2 = "const BUILD = '2026-10-20.2';";
if (src.split(from2).length - 1 !== 1) { console.error('ANCHOR MISSING: build'); process.exit(1); }
src = src.replace(from2, to2);
fs.writeFileSync(FILE, src);
console.log('  ok  strand weather per route · build 2026-10-20.2  md5 ' + crypto.createHash('md5').update(src).digest('hex'));
