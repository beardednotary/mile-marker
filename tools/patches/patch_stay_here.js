// Ray, playing Route 4 to Minot (2026-11-13): "I make a decision (go inside depot) the
// next screen is the same thing I just read with options closed. I don't believe that's
// how it worked before."
//
// It is not how it worked before. Routes 1-3 have four choices between them that come back
// to the scene they started in. Route 4 has thirty-two (fill up, look at something, talk to
// somebody), and the engine treated coming back as arriving: it cleared the screen and
// played the whole scene again.
//
// Now a choice that leaves you where you are does not restart the scene. What happened is
// added under what you have already read, and the choices that are left come back. Nothing
// is re-read, onLoad does not run twice, and there is no "Back on the road" button for a
// road you never left. Resuming a saved game still plays the scene from the top.
const apply = require('./_apply.js');

apply('mile-marker-v2.html', [
  { name: 'handleChoice: staying is not arriving',
    from: `  const currentNode = NODES[state.currentNode];
  if (result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome]) {
    saveGame(result.next);   // closing the app mid-outcome resumes after the choice, not before it
    const prose = currentNode.outcomes[result.outcome];
    showOutcomeThen(typeof prose === 'function' ? prose(state) : prose, result.next);
    return;
  }
  loadNode(result.next);
}`,
    to: `  const currentNode = NODES[state.currentNode];
  const prose = result.outcome && currentNode && currentNode.outcomes && currentNode.outcomes[result.outcome];
  const told = prose ? (typeof prose === 'function' ? prose(state) : prose) : null;
  // A look, a fill, a word with somebody: you are still where you were.
  if (result.next && resolveSlot(result.next) === state.currentNode) { stayHere(told); return; }
  if (told) {
    saveGame(result.next);   // closing the app mid-outcome resumes after the choice, not before it
    showOutcomeThen(told, result.next);
    return;
  }
  loadNode(result.next);
}

// The scene is not played again. What happened goes under what you have read, and the
// choices that are left come back: showIf drops the one you just used.
function stayHere(texts) {
  const node = NODES[state.currentNode];
  saveGame(state.currentNode);
  const sceneText = document.getElementById('scene-text');
  const choicesSection = document.getElementById('choices-section');
  choicesSection.classList.remove('visible');
  document.getElementById('choices').innerHTML = '';
  clearTimeouts();
  state.animating = true;
  let wait = 320;
  if (texts && texts.length) {
    const hr = document.createElement('div');
    hr.style.cssText = 'border-top:2px solid rgba(128,128,128,0.35);margin:12px 0;';
    sceneText.appendChild(hr);
    texts.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'scene-paragraph';
      div.style.marginTop = '10px';
      div.innerHTML = t;
      handLetter(div);
      sceneText.appendChild(div);
      state.timeouts.push(setTimeout(() => div.classList.add('visible'), i * 500 + 100));
    });
    // Start reading at the rule, not at the top of a scene you have already read.
    try { hr.scrollIntoView({ block: 'start', behavior: motionReduced() ? 'auto' : 'smooth' }); } catch (e) {}
    document.getElementById('tap-hint').style.display = 'block';
    wait = texts.length * 500 + 400;
  }
  state.timeouts.push(setTimeout(() => {
    document.getElementById('tap-hint').style.display = 'none';
    renderChoices(node);
    choicesSection.classList.add('visible');
    state.animating = false;
  }, wait));
}` },
  { name: 'build stamp', from: `const BUILD = '2026-11-13.1';`, to: `const BUILD = '2026-11-13.2';` }
]);
