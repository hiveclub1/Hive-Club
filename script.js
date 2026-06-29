const WEB3_ACCESS_KEY = "91cc0db1-566d-4958-9c62-3f03b199a63a";

const menuButton = document.querySelector("[data-menu]");
const navLinks = document.querySelector("[data-links]");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open", navLinks.classList.contains("open"));
  });
}

const page = document.body.dataset.page;
if (page) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === page) link.classList.add("active");
  });
}

const courseSelect = document.getElementById("courseSelect");
if (courseSelect) {
  const params = new URLSearchParams(window.location.search);
  const selectedCourse = params.get("course");
  if (selectedCourse) {
    [...courseSelect.options].forEach((option) => {
      if (option.value === selectedCourse || option.textContent === selectedCourse) {
        option.selected = true;
      }
    });
  }
}

const form = document.getElementById("bookingForm");
const notice = document.getElementById("formNotice");
const accessKeyField = document.getElementById("access_key");

if (accessKeyField) accessKeyField.value = WEB3_ACCESS_KEY;

function showNotice(type, message) {
  if (!notice) return;
  notice.className = `notice ${type}`;
  notice.textContent = message;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        form.reset();
        showNotice("ok", "Inscription envoyée. Nous vous contacterons bientôt.");
      } else {
        showNotice("err", "L’envoi n’a pas fonctionné. Contactez-nous au 55 328 004.");
      }
    } catch (error) {
      showNotice("err", "Erreur de connexion. Contactez-nous au 55 328 004.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer l’inscription";
    }
  });
}
