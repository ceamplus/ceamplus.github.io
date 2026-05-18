const header = document.querySelector("[data-header]");
const form = document.querySelector("[data-contact-form]");
const statusMessage = document.querySelector("[data-form-status]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (form && statusMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get("name") || "Thanks").trim();
    statusMessage.textContent = `${name}, your inquiry is ready to send once this site is connected to an email or form service.`;
    form.reset();
  });
}
