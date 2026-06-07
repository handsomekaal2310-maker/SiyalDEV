const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEEELqQRG3mgXc1aqlEQf9cOPXPHD5XgGC1jRRzGcXdeuqBVNRmjfRHpa3p7XA7nhYwQ/exec";

const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const modal = document.querySelector("[data-modal]");
const pageContent = document.querySelector("[data-page-content]");
const openFormButtons = document.querySelectorAll("[data-open-form]");
const closeFormButtons = document.querySelectorAll("[data-close-form]");
const forms = document.querySelectorAll("[data-lead-form]");
const year = document.querySelector("[data-year]");
const leadership = document.querySelector(".leadership");
let lastFocusedElement = null;
let lastScrollY = window.scrollY;

const countryCodes = [
  { label: "India", code: "+91" },
  { label: "UAE", code: "+971" },
  { label: "USA", code: "+1" },
  { label: "UK", code: "+44" },
  { label: "Canada", code: "+1" },
  { label: "Australia", code: "+61" },
  { label: "Singapore", code: "+65" },
  { label: "Saudi Arabia", code: "+966" },
  { label: "Qatar", code: "+974" },
  { label: "Kuwait", code: "+965" },
  { label: "Oman", code: "+968" },
  { label: "Bahrain", code: "+973" }
];

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

function openModal(event) {
  if (!modal) return;
  lastFocusedElement = event?.currentTarget || document.activeElement;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  if (pageContent) pageContent.inert = true;
  body.classList.add("modal-open");
  const firstInput = modal.querySelector("input");
  if (firstInput) firstInput.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (pageContent) pageContent.inert = false;
  body.classList.remove("modal-open");
  if (lastFocusedElement) lastFocusedElement.focus();
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (year) {
  year.textContent = new Date().getFullYear();
}

if (leadership) {
  window.addEventListener("scroll", () => {
    const rect = leadership.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight && rect.bottom > 0;
    const scrollingDown = window.scrollY > lastScrollY;

    if (isInView && scrollingDown) {
      leadership.classList.add("is-zoomed");
    } else if (isInView && !scrollingDown) {
      leadership.classList.remove("is-zoomed");
    }

    lastScrollY = window.scrollY;
  }, { passive: true });
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    body.classList.remove("menu-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  });
});

openFormButtons.forEach((button) => button.addEventListener("click", openModal));
closeFormButtons.forEach((button) => button.addEventListener("click", closeModal));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
  if (event.key !== "Tab" || !modal?.classList.contains("is-open")) return;

  const focusable = modal.querySelectorAll("button, input, select, textarea, a[href]");
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = item.classList.contains("is-open");
    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("is-open");
      const faqButton = faq.querySelector("button");
      const answer = faq.querySelector(".faq-answer");
      faqButton.setAttribute("aria-expanded", "false");
      answer.hidden = true;
    });
    if (!isOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      item.querySelector(".faq-answer").hidden = false;
    }
  });
});

forms.forEach((form) => {
  const phoneInput = form.querySelector("input[name='phone']");
  if (phoneInput && !phoneInput.closest(".phone-field")) {
    const wrapper = document.createElement("div");
    wrapper.className = "phone-field";

    const select = document.createElement("select");
    select.name = "countryCode";
    select.setAttribute("aria-label", "Country code");
    countryCodes.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = `${country.label} ${country.code}`;
      select.appendChild(option);
    });

    phoneInput.parentNode.insertBefore(wrapper, phoneInput);
    wrapper.appendChild(select);
    wrapper.appendChild(phoneInput);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const submitButton = form.querySelector("button[type='submit']");
    status.classList.remove("is-error");

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_GOOGLE")) {
      status.textContent = "Google Sheet URL app.js me add karna hai.";
      status.classList.add("is-error");
      return;
    }

    const formData = new FormData(form);
    const countryCode = formData.get("countryCode") || "";
    const phone = String(formData.get("phone") || "").trim();
    if (phone && countryCode && !phone.startsWith("+")) {
      formData.set("phone", `'${countryCode} ${phone}`);
    } else if (phone && phone.startsWith("+")) {
      formData.set("phone", `'${phone}`);
    }
    const payload = new URLSearchParams(formData);
    payload.set("page", window.location.href);
    payload.set("submittedAt", new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }));

    submitButton.disabled = true;
    status.textContent = "Sending...";

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
        body: payload
      });
      form.reset();
      status.textContent = "Request sent. Our team will contact you soon.";
    } catch (error) {
      status.textContent = "Submit nahi hua. Please dobara try karein.";
      status.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
    }
  });
});
