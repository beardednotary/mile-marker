// When what happened is added under the scene, keep a few lines of the scene in view
// above the rule, so it reads as a continuation and not as a new screen.
const apply = require('./_apply.js');
apply('mile-marker-v2.html', [
  { name: 'leave some of the scene above the rule',
    from: `    hr.style.cssText = 'border-top:2px solid rgba(128,128,128,0.35);margin:12px 0;';
    sceneText.appendChild(hr);
    texts.forEach((t, i) => {`,
    to: `    hr.style.cssText = 'border-top:2px solid rgba(128,128,128,0.35);margin:12px 0;scroll-margin-top:110px;';
    sceneText.appendChild(hr);
    texts.forEach((t, i) => {` }
]);
