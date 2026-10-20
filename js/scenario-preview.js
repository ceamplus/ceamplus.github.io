/* Public presentation only: bounded fictional arithmetic, no engine imports, collection or persistence. */
(() => {
  const bindExample = (attribute, outputId, calculate) => {
    const buttons = [...document.querySelectorAll('[' + attribute + ']')];
    const output = document.getElementById(outputId);
    if (!buttons.length || !output) return;
    buttons[0].parentElement.hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => {
      const rate = Number(button.getAttribute(attribute));
      output.textContent = calculate(rate);
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  };
  const dollars = value => '$' + value.toLocaleString('en-US');
  bindExample('data-marketing-response', 'marketing-projection', rate => {
    const responses = 10000 * rate / 100;
    const purchases = responses * .25;
    const revenue = purchases * 120;
    const contribution = revenue * .4 - 1200;
    return 'Fictional conditional projection at an assumed ' + rate + '% response: ' + responses + ' responses; ' + purchases + ' purchases (sales count); ' + dollars(revenue) + ' revenue; ' + dollars(contribution) + ' contribution after advertising spend.';
  });
  bindExample('data-research-start', 'research-projection', rate => {
    const starts = 800 * rate / 100;
    const completed = starts * .8;
    return 'Fictional conditional projection at an assumed ' + rate + '% survey-start rate: ' + starts + ' survey starts; ' + completed + ' completed responses; ' + dollars(400 + completed * 10) + ' recruitment plus incentive cost.';
  });
  const steps = [...document.querySelectorAll('.preview-step')];
  const controls = document.querySelector('.preview-step-controls');
  if (!steps.length || !controls) return;
  const previous = document.getElementById('preview-previous');
  const next = document.getElementById('preview-next');
  const status = document.getElementById('preview-step-status');
  let current = 0;
  const update = () => {
    status.textContent = `Step ${current + 1} of ${steps.length}`;
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
  };
  const show = index => {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, i) => { step.open = i === current; });
    update();
    steps[current].querySelector('summary').focus();
  };
  steps.forEach((step, index) => step.addEventListener('toggle', () => {
    if (step.open) { current = index; update(); }
  }));
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  controls.hidden = false;
  update();
})();
