// The road under you, named. Route 2 leaves US-61 at Natchez and the sign never knew it.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const FILE = path.join(__dirname, '..', '..', 'routes', 'deep-south.js');
let src = fs.readFileSync(FILE, 'utf8');
const NL = src.includes('\r\n') ? '\r\n' : '\n';
const edits = [];
const E = (name, from, to) => edits.push({ name, from: from.replace(/\n/g, NL), to: to.replace(/\n/g, NL) });

E('past Natchez you are on 98',
`    location: "US-98 East — Shoulder",
    tags: ["money","tension"],
    mile: 400,`,
`    location: "US-98 East — Shoulder",
    tags: ["money","tension"],
    mile: 400,
    shield: "US 98 EAST",`);

E('63 south out of the fork',
`    location: "MS-63 South — Toward the Coast",
    tags: ["travel","night"],
    mile: 478,`,
`    location: "MS-63 South — Toward the Coast",
    tags: ["travel","night"],
    mile: 478,
    shield: "MS 63 SOUTH",`);

E('49 south out of the fork',
`    location: "US-49 South — Through Wiggins",
    tags: ["travel","night"],
    mile: 472,`,
`    location: "US-49 South — Through Wiggins",
    tags: ["travel","night"],
    mile: 472,
    shield: "US 49 SOUTH",`);

E('then west on the beach highway',
`    location: "Beach Highway — West of the Harbour",
    tags: ["travel","night"],
    mile: 502,`,
`    location: "Beach Highway — West of the Harbour",
    tags: ["travel","night"],
    mile: 502,
    shield: "US 90 WEST",`);

E('Pascagoula names itself on arrival',
`    location: "Pascagoula, MS — Mile 528",
    tags: ["victory"],
    mile: 528,`,
`    location: "Pascagoula, MS — Mile 528",
    tags: ["victory"],
    mile: 528,
    arrival: "Pascagoula, MS",`);

// You aimed at the Pass the whole way west. The road kept going and ended somewhere else.
E('and so does the town the road actually ends in',
`    location: "Bay St. Louis, MS — Mile 522",
    tags: ["victory"],
    mile: 522,
    heading: "the Pass",`,
`    location: "Bay St. Louis, MS — Mile 522",
    tags: ["victory"],
    mile: 522,
    arrival: "Bay St. Louis, MS",
    heading: "Bay St. Louis",`);

E('Mobile too',
`    location: "Mobile, AL — Mile 547",
    tags: ["victory"],
    mile: 547,`,
`    location: "Mobile, AL — Mile 547",
    tags: ["victory"],
    mile: 547,
    arrival: "Mobile, AL",`);

for (const e of edits) {
  const c = src.split(e.from).length - 1;
  if (c !== 1) { console.error('ANCHOR ' + (c === 0 ? 'MISSING' : 'x' + c) + ': ' + e.name); process.exit(1); }
}
for (const e of edits) { src = src.replace(e.from, () => e.to); console.log('  ok  ' + e.name); }
fs.writeFileSync(FILE, src);
console.log('md5 ' + crypto.createHash('md5').update(src).digest('hex'));
