// A deliberately small, isolated illustration. Does not access assessment or Studio storage.
(() => {
  const controls = document.querySelector('#home-decision-controls');
  if (!controls) return;
  const revenue = document.querySelector('#home-revenue-change');
  const cost = document.querySelector('#home-cost-change');
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  function update() {
    const r = 48000 * (1 + Number(revenue.value) / 100);
    const c = 36000 * (1 + Number(cost.value) / 100);
    document.querySelector('#home-revenue-label').textContent = `${revenue.value}%`;
    document.querySelector('#home-cost-label').textContent = `${cost.value}%`;
    document.querySelector('#home-scenario-revenue').textContent = money(r);
    document.querySelector('#home-scenario-remainder').textContent = money(r - c);
    const change = r - c - 12000;
    document.querySelector('#home-decision-result').textContent = `${change === 0 ? 'No change from' : money(Math.abs(change)) + (change > 0 ? ' above' : ' below')} the $12,000 baseline remainder. This follows your assumptions; it is not a forecast.`;
  }
  controls.hidden = false;
  controls.addEventListener('input', update);
  document.querySelector('#home-decision-reset').addEventListener('click', () => { revenue.value = '0'; cost.value = '0'; update(); });
  update();
})();
