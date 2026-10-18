/* Select an existing instrument without changing, starting, or submitting it. */
(() => {
  const select = document.querySelector('[data-organization-select]');
  if (!select) return;
  const context = new URLSearchParams(window.location.search).get('context');
  if (!context || !Array.from(select.options).some(option => option.value === context)) return;
  select.value = context;
  select.dispatchEvent(new Event('change', { bubbles: true }));
})();
