// The page is shorter while the choices are hidden, so the first scroll to the rule stops
// early. Scroll to it again once the choices are back, so what happened and what you can
// do next are on the screen together.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'declare the rule outside the branch',
    from: `  let wait = 320;
  if (texts && texts.length) {
    const hr = document.createElement('div');`,
    to: `  let wait = 320, hr = null;
  const toRule = () => { try { if (hr) hr.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' }); } catch (e) {} };
  if (texts && texts.length) {
    hr = document.createElement('div');` },
  { name: 'first scroll uses the helper',
    from: `    try { hr.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' }); } catch (e) {}
    document.getElementById('tap-hint').style.display = 'block';`,
    to: `    toRule();
    document.getElementById('tap-hint').style.display = 'block';` },
  { name: 'scroll again when the choices are back',
    from: `    renderChoices(node);
    choicesSection.classList.add('visible');
    state.animating = false;
  }, wait));
}`,
    to: `    renderChoices(node);
    choicesSection.classList.add('visible');
    state.animating = false;
    toRule();
  }, wait));
}` }
]);
