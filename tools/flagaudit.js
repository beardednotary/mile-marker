// Flag audit, both directions, from the source text of the game.
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'mile-marker-v2.html'), 'utf8');
const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).pop();

const sets = new Set(), reads = new Set();
// setters: flags: { a: true, "b": true }, onLoad s.flags.x = ..., radio sets: 'x', applyFlags literal
for (const m of src.matchAll(/flags:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/"?([A-Za-z_]\w*)"?\s*:/g)) sets.add(k[1]);
for (const m of src.matchAll(/\.flags\.([A-Za-z_]\w*)\s*=[^=]/g)) sets.add(m[1]);
for (const m of src.matchAll(/\.flags\[entry\.sets\]/g)) { /* dynamic: handled below */ }
for (const m of src.matchAll(/sets:\s*'([A-Za-z_]\w*)'/g)) sets.add(m[1]);
// readers: s.flags.x / state.flags.x not followed by '=', requires {"x":bool}, needs: 'x', requires.flags
for (const m of src.matchAll(/\.flags\.([A-Za-z_]\w*)\b(?!\s*=[^=])/g)) reads.add(m[1]);
for (const m of src.matchAll(/needs:\s*'([A-Za-z_]\w*)'/g)) reads.add(m[1]);
for (const m of src.matchAll(/requires:\s*\{([^}]*)\}/g)) for (const k of m[1].matchAll(/"?([A-Za-z_]\w*)"?\s*:/g)) if (!/Min$/.test(k[1])) reads.add(k[1]);
for (const m of src.matchAll(/\.flags\[entry\.needs\]/g)) { /* dynamic */ }

const setNeverRead = [...sets].filter(f => !reads.has(f)).sort();
const readNeverSet = [...reads].filter(f => !sets.has(f)).sort();
console.log('flags set:  ' + sets.size + '   flags read: ' + reads.size);
console.log('SET, never read : ' + (setNeverRead.join(', ') || '—'));
console.log('READ, never set : ' + (readNeverSet.join(', ') || '—'));
process.exitCode = readNeverSet.length ? 1 : 0;
