/* Native disclosures remain usable without JavaScript; this adds hash and print support. */
(() => {
  const disclosures = [...document.querySelectorAll('details[data-site-disclosure]')];
  if (!disclosures.length) return;

  function revealHash(hash, scroll = false) {
    if (!hash || hash === '#') return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = document.getElementById(id) || document.getElementsByName(id)[0];
    if (!target) return;
    let ancestor = target;
    while (ancestor) {
      if (ancestor.tagName === 'DETAILS') ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  window.addEventListener('hashchange', () => revealHash(window.location.hash, true));
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) revealHash(url.hash);
  });
  revealHash(window.location.hash, true);

  const toolbar = document.querySelector('[data-disclosure-toolbar]');
  if (toolbar) {
    toolbar.hidden = false;
    toolbar.addEventListener('click', event => {
      const button = event.target.closest('[data-disclosure-action]');
      if (!button) return;
      const open = button.dataset.disclosureAction === 'expand';
      disclosures.forEach(detail => { detail.open = open; });
      const notice = toolbar.querySelector('[role="status"]');
      if (notice) notice.textContent = open ? 'All topic sections expanded.' : 'All topic sections collapsed.';
    });
  }

  let printState = null;
  window.addEventListener('beforeprint', () => {
    if (printState) return;
    printState = [...document.querySelectorAll('main details')].map(detail => [detail, detail.open]);
    printState.forEach(([detail]) => { detail.open = true; });
  });
  window.addEventListener('afterprint', () => {
    printState?.forEach(([detail, wasOpen]) => { detail.open = wasOpen; });
    printState = null;
  });
})();
