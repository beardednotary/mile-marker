// The line you cannot read was blurring the rail under it as well as the letters.
// (The stylesheet half of this was applied on the first run; this is the module half.)
const apply = require('./_apply.js');
apply('routes/deep-south.js', [
  { name: 'far is a span inside the row',
    from: `(/\\bfar\\b/.test(cls) ? " aria-hidden='true'" : '') + ">" + text + "</div>";`,
    to: `(/\\bfar\\b/.test(cls) ? " aria-hidden='true'><span class='far'>" + text + "</span>" : ">" + text) + "</div>";` },
  { name: 'row class without far',
    from: `return "<div class='mq-row" + cls + "'" + (`,
    to: `return "<div class='mq-row" + cls.replace(' far', '') + "'" + (` }
]);
