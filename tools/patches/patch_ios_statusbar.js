// On the iPhone (TestFlight build 2, 2026-11-24) the text could not scroll and the header sat
// under the clock. The scrolling was capacitor.config.json (ios.scrollEnabled: false turns off
// the web view's scrolling outright); that setting is gone. This adds a strip the colour of the
// ground behind the status bar, so text scrolling up does not run under the clock and battery.
// It is as tall as the safe area, so in a browser, where that is zero, it is not there at all.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'status bar backdrop',
    from: `html.app, html.app body { overscroll-behavior: none; }`,
    to: `html.app, html.app body { overscroll-behavior: none; }
html.app body::before { content: ''; position: fixed; top: 0; left: 0; right: 0; height: env(safe-area-inset-top, 0px); background: var(--ground); z-index: 1000; pointer-events: none; transition: background 0.9s ease; }` },
  { name: 'build stamp', from: `const BUILD = '2026-11-24.1';`, to: `const BUILD = '2026-11-24.2';` }
]);
