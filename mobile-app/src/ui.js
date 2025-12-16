// ==================== UTILITIES ====================
let toastHideTimer = null;

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  const messageEl = document.getElementById("toastMessage");
  if (!toast || !messageEl) return;

  // Reset previous state so consecutive toasts reliably animate
  toast.classList.remove("show");
  if (toastHideTimer) {
    clearTimeout(toastHideTimer);
    toastHideTimer = null;
  }

  toast.className = "toast " + type;

  // Render rich content (inline SVG/icons) when provided, otherwise plain text
  const hasRichContent =
    typeof message === "string" &&
    /<svg|<span|<strong|<em|<br|<div|<p|<ul|<li|&nbsp;/.test(message);

  if (hasRichContent) {
    const wrapper = document.createElement("span");
    wrapper.innerHTML = message;
    messageEl.replaceChildren(...Array.from(wrapper.childNodes));
  } else {
    messageEl.textContent = message;
  }

  const iconEl = toast.querySelector(".toast-icon");
  if (iconEl) iconEl.textContent = "";

  // Force reflow so animation can retrigger when class is added
  // eslint-disable-next-line no-unused-expressions
  void toast.offsetWidth;

  toast.classList.add("show");

  // Adaptive duration based on message length
  // Base: 3.5s, +80ms per 10 chars, max 5.5s
  const baseTime = 3500;
  const charTime = Math.floor(message.length / 10) * 80;
  const duration = Math.min(5500, baseTime + charTime);

  toastHideTimer = setTimeout(() => {
    toast.classList.remove("show");
    toastHideTimer = null;
  }, duration);
}

// Show tooltip info on mobile (tap handler for info icons)
function showInfoTooltip(event) {
  event.preventDefault();
  event.stopPropagation();
  const title = event.currentTarget.getAttribute('title');
  if (title) {
    showToast(title, "info");
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove("open");
  if (modal.dataset.interval) {
    clearInterval(parseInt(modal.dataset.interval));
    delete modal.dataset.interval;
  }
}

function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("open");
  }
}

function escapeHtml(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m] || m)
  );
}

// Simple accordion toggles
function toggleAccordion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("open");
}
window.toggleAccordion = toggleAccordion;
