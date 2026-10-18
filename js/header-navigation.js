/* Native <details> supplies keyboard activation and a no-JavaScript fallback. */
(() => {
  const disclosures = document.querySelectorAll('.site-header .nav-more');
  disclosures.forEach(disclosure => {
    const summary = disclosure.querySelector('summary');
    disclosure.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !disclosure.open) return;
      disclosure.open = false;
      summary.focus();
      event.preventDefault();
      event.stopPropagation();
    });
    document.addEventListener('click', event => {
      if (disclosure.open && !disclosure.contains(event.target)) disclosure.open = false;
    });
  });
})();
