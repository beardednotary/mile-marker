// The cardboard sign's rule caught every letter the engine makes, not just each line,
// so it stacked one letter per row.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'cardboard: lines are blocks, letters are not',
    from: `.rs-cardboard span { display: block; font-size: 19px; line-height: 1.22; letter-spacing: 0.02em; }`,
    to: `.rs-cardboard > .hand { display: block; font-size: 19px; line-height: 1.22; letter-spacing: 0.02em; }` }
]);
