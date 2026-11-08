const therapistSelect = document.querySelector("#therapist-select");
const appointmentForm = document.querySelector("#appointment-form");
const appointmentFields = document.querySelector("#appointment-fields");
const appointmentReview = document.querySelector("#appointment-review");
const appointmentSummary = document.querySelector("#appointment-summary");
const sendAnimation = document.querySelector("#mail-animation");
const reviewAppointmentButton = document.querySelector("#edit-request");
const sendAppointmentButton = document.querySelector("#send-request");
const pageByHash = new Map([
  ["o-nas", "about"],
  ["cennik", "about"],
  ["individual", "therapy-individual"],
  ["couples", "therapy-couples"],
  ["children", "therapy-children"],
  ["prihlasenie", "appointment"]
]);
let currentPage = document.body.dataset.page;
let focusAppointmentAfterNavigation = false;

function updatePageFromHash() {
  const hash = window.location.hash.slice(1);
  const nextPage = pageByHash.get(hash) || "home";

  if (nextPage === currentPage) {
    return;
  }

  currentPage = nextPage;
  document.body.dataset.page = nextPage;
  const shouldFocusAppointment = focusAppointmentAfterNavigation && nextPage === "appointment";
  focusAppointmentAfterNavigation = false;

  if (nextPage === "appointment") {
    appointmentFields.hidden = false;
    appointmentReview.hidden = true;
    sendAnimation.hidden = true;
    sendAnimation.classList.remove("is-sending", "is-complete");
  }

  if (hash) {
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });

      if (shouldFocusAppointment) {
        appointmentForm.querySelector("[name='given-name']").focus({ preventScroll: true });
      }
    });
  }
}

window.addEventListener("hashchange", updatePageFromHash);
updatePageFromHash();

document.querySelectorAll(".booking-button").forEach((button) => {
  button.addEventListener("click", () => {
    therapistSelect.value = button.dataset.therapist;
    focusAppointmentAfterNavigation = true;
    window.location.hash = "prihlasenie";
  });
});

function displayAppointmentReview() {
  const formData = new FormData(appointmentForm);
  const summary = [
    ["Meno", `${formData.get("given-name")} ${formData.get("family-name")}`.trim()],
    ["Adresa", `${formData.get("street-address")}, ${formData.get("postal-code")}`],
    ["Telefón", formData.get("tel")],
    ["E-mail", formData.get("email")],
    ["Psychológ", formData.get("therapist")],
    ["Poznámka", formData.get("message")]
  ].filter(([, value]) => String(value).trim());

  appointmentSummary.replaceChildren();

  summary.forEach(([label, value]) => {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    item.append(term, description);
    appointmentSummary.append(item);
  });

  appointmentFields.hidden = true;
  appointmentReview.hidden = false;
  appointmentReview.focus({ preventScroll: true });
}

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!appointmentForm.checkValidity()) {
    appointmentForm.reportValidity();
    return;
  }

  displayAppointmentReview();
});

reviewAppointmentButton.addEventListener("click", () => {
  appointmentReview.hidden = true;
  appointmentFields.hidden = false;
  appointmentFields.querySelector("[name='given-name']").focus({ preventScroll: true });
});

sendAppointmentButton.addEventListener("click", () => {
  appointmentReview.hidden = true;
  sendAnimation.hidden = false;
  sendAnimation.classList.remove("is-sending", "is-complete");
  void sendAnimation.offsetWidth;

  if (reducedMotion.matches) {
    sendAnimation.classList.add("is-complete");
    return;
  }

  sendAnimation.classList.add("is-sending");
  window.setTimeout(() => {
    sendAnimation.classList.remove("is-sending");
    sendAnimation.classList.add("is-complete");
  }, 1350);
});

const heroSection = document.querySelector("#domov");
const heroNegation = document.querySelector(".hero-negation");
const confettiWord = document.querySelector(".hero-confetti-word");
const originalWordMarkup = confettiWord.innerHTML;
const originalWordLabel = confettiWord.getAttribute("aria-label");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mainSections = [...document.querySelectorAll('main > section[data-view="home"][id]')];
let completionTimer;
let activeMainSection = heroSection;

function completeHeroPhrase() {
  confettiWord.classList.remove("is-playing");
  confettiWord.classList.add("is-complete");
  confettiWord.textContent = "s nami.";
  confettiWord.setAttribute("aria-label", "s nami.");
  heroNegation.classList.add("is-crossed");
}

function resetHeroPhrase() {
  window.clearTimeout(completionTimer);
  confettiWord.classList.remove("is-playing", "is-complete");
  confettiWord.innerHTML = originalWordMarkup;
  confettiWord.setAttribute("aria-label", originalWordLabel);
  heroNegation.classList.remove("is-crossed");
}

confettiWord.addEventListener("mouseenter", () => {
  if (confettiWord.classList.contains("is-playing") || confettiWord.classList.contains("is-complete")) {
    return;
  }

  if (reducedMotion.matches) {
    completeHeroPhrase();
    return;
  }

  confettiWord.classList.add("is-playing");
  completionTimer = window.setTimeout(completeHeroPhrase, 920);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const destination = document.getElementById(link.hash.slice(1));

  if (destination && destination !== heroSection) {
    link.addEventListener("click", resetHeroPhrase);
  }
});

window.addEventListener("scroll", () => {
  const readingLine = window.innerHeight * 0.35;
  let nextSection = heroSection;

  mainSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= readingLine) {
      nextSection = section;
    }
  });

  if (nextSection !== activeMainSection) {
    activeMainSection = nextSection;

    if (nextSection !== heroSection) {
      resetHeroPhrase();
    }
  }
}, { passive: true });

const paceCircle = document.querySelector(".circle-inner");
const approachVisual = document.querySelector(".approach-visual");

paceCircle.addEventListener("mouseenter", () => {
  if (!reducedMotion.matches) {
    approachVisual.classList.add("is-rippling");
  }
});

paceCircle.addEventListener("mouseleave", () => {
  approachVisual.classList.remove("is-rippling");
});

const reviewForm = document.querySelector("#review-form");
const reviewList = document.querySelector("#review-list");
const reviewFormStatus = document.querySelector("#review-form-status");

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!reviewForm.checkValidity()) {
    reviewForm.reportValidity();
    return;
  }

  const formData = new FormData(reviewForm);
  const rating = Number(formData.get("rating"));
  const review = document.createElement("blockquote");
  const stars = document.createElement("div");
  const text = document.createElement("p");
  const author = document.createElement("cite");

  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${rating} z 5 hviezdičiek`);
  stars.textContent = "★".repeat(rating);
  text.textContent = `„${String(formData.get("text")).trim()}“`;
  author.textContent = String(formData.get("name")).trim() || "Anonymne";
  review.append(stars, text, author);
  reviewList.prepend(review);
  reviewFormStatus.textContent = "Recenzia sa pridala do tohto náhľadu; na trvalé uloženie treba zapojiť server.";
  reviewForm.reset();
});