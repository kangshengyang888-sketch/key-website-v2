const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const header = document.querySelector(".site-header");
const magicIntro = document.querySelector(".magic-intro");
const aceCard = document.querySelector(".js-ace-card");
const secondPage = document.querySelector("#brand");
const deckFaces = ["A♠", "K♥", "Q♦", "J♣", "10♠", "9♥", "8♦", "7♣", "joker", "A♦", "K♣", "Q♠"];
const proximityRadius = 210;
const finalRadius = 18;

let lastTrailAt = 0;
let lastParticleAt = 0;
let finalRevealStarted = false;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const randomBetween = (min, max) => Math.random() * (max - min) + min;
const isRedCard = (face) => face.includes("♥") || face.includes("♦");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");

    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -60px 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

window.addEventListener("scroll", () => {
  if (!header) {
    return;
  }

  const opacity = window.scrollY > 20 ? 0.9 : 0.72;

  header.style.background = `rgba(8, 6, 13, ${opacity})`;
});

const createTrailCard = (x, y) => {
  const now = performance.now();

  if (now - lastTrailAt < 34) {
    return;
  }

  lastTrailAt = now;

  const face = deckFaces[Math.floor(Math.random() * deckFaces.length)];
  const card = document.createElement("span");

  card.className = "trail-card";
  card.textContent = face;
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.style.setProperty("--rot", `${randomBetween(-42, 42)}deg`);
  card.style.setProperty("--trail-x", `${randomBetween(-42, 42)}px`);
  card.style.setProperty("--trail-y", `${randomBetween(18, 82)}px`);

  if (isRedCard(face)) {
    card.classList.add("is-red");
  }

  document.body.appendChild(card);
  window.setTimeout(() => card.remove(), 900);
};

const createMagicParticle = (x, y, progress) => {
  const particle = document.createElement("span");
  const distance = randomBetween(34, 150 + progress * 130);
  const angle = randomBetween(0, Math.PI * 2);

  particle.className = "magic-particle";
  particle.style.left = `${x + randomBetween(-28, 28)}px`;
  particle.style.top = `${y + randomBetween(-28, 28)}px`;
  particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
  particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
  particle.style.setProperty("--size", `${randomBetween(4, 9 + progress * 8)}px`);

  document.body.appendChild(particle);
  window.setTimeout(() => particle.remove(), 850);
};

const createBurstPiece = (x, y) => {
  const face = deckFaces[Math.floor(Math.random() * deckFaces.length)];
  const piece = document.createElement("span");
  const distance = randomBetween(140, 360);
  const angle = randomBetween(0, Math.PI * 2);

  piece.className = "burst-piece";
  piece.textContent = face;
  piece.style.setProperty("--start-x", `${x}px`);
  piece.style.setProperty("--start-y", `${y}px`);
  piece.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
  piece.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
  piece.style.setProperty("--rot", `${randomBetween(-560, 560)}deg`);
  piece.style.setProperty("--delay", `${randomBetween(0, 0.12)}s`);

  if (isRedCard(face)) {
    piece.classList.add("is-red");
  }

  document.body.appendChild(piece);
  window.setTimeout(() => piece.remove(), 1200);
};

const getAceCenter = () => {
  if (!aceCard) {
    return null;
  }

  const rect = aceCard.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
};

const finishIntro = () => {
  document.body.classList.remove("intro-locked");
  document.body.classList.add("intro-complete");
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });

  window.requestAnimationFrame(() => {
    secondPage?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const startFinalReveal = () => {
  if (finalRevealStarted || !magicIntro || !aceCard) {
    return;
  }

  finalRevealStarted = true;
  const center = getAceCenter();

  if (!center) {
    return;
  }

  aceCard.style.setProperty("--split-progress", "1");
  magicIntro.classList.add("is-splitting", "is-photo", "is-final");

  for (let index = 0; index < 42; index += 1) {
    createBurstPiece(center.x, center.y);
  }

  for (let index = 0; index < 28; index += 1) {
    createMagicParticle(center.x, center.y, 1);
  }

  window.setTimeout(finishIntro, 950);
};

const updateAceByPointer = (x, y) => {
  if (!magicIntro || !aceCard || finalRevealStarted) {
    return;
  }

  const center = getAceCenter();

  if (!center) {
    return;
  }

  const distance = Math.hypot(x - center.x, y - center.y);
  const progress = clamp((proximityRadius - distance) / proximityRadius, 0, 1);

  aceCard.style.setProperty("--split-progress", progress.toFixed(3));
  magicIntro.classList.toggle("is-splitting", progress > 0);

  if (progress > 0) {
    const now = performance.now();
    const interval = 90 - progress * 58;

    if (now - lastParticleAt > interval) {
      lastParticleAt = now;
      const particleCount = Math.ceil(1 + progress * 5);

      for (let index = 0; index < particleCount; index += 1) {
        createMagicParticle(center.x, center.y, progress);
      }
    }
  }

  if (distance <= finalRadius) {
    startFinalReveal();
  }
};

const resetAce = () => {
  if (!magicIntro || !aceCard || finalRevealStarted) {
    return;
  }

  aceCard.style.setProperty("--split-progress", "0");
  magicIntro.classList.remove("is-splitting", "is-photo", "is-final");
};

window.addEventListener("pointermove", (event) => {
  if (document.body.classList.contains("intro-complete")) {
    return;
  }

  createTrailCard(event.clientX, event.clientY);
  updateAceByPointer(event.clientX, event.clientY);
});

window.addEventListener(
  "pointerdown",
  (event) => {
    if (document.body.classList.contains("intro-complete")) {
      return;
    }

    createTrailCard(event.clientX, event.clientY);
    updateAceByPointer(event.clientX, event.clientY);
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (!magicIntro || document.body.classList.contains("intro-complete")) {
      return;
    }

    // Keep the opening magic interaction from turning into page scroll on phones.
    event.preventDefault();
  },
  { passive: false }
);

if (magicIntro) {
  magicIntro.addEventListener("pointerleave", resetAce);
}

if (aceCard) {
  aceCard.addEventListener("click", startFinalReveal);
  aceCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startFinalReveal();
    }
  });
}
