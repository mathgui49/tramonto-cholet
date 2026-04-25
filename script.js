// Tramonto - vitrine site interactions

(() => {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav
  const nav = document.querySelector(".nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("primary-menu");

  if (nav && toggle && menu) {
    const close = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const open = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      nav.classList.contains("is-open") ? close() : open();
    });

    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 760px)").matches) close();
      })
    );

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 760px)").matches) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) close();
    });
  }

  // Menu filters
  const chips = document.querySelectorAll(".chip[data-filter]");
  const groups = document.querySelectorAll(".menu__group[data-cat]");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const target = chip.dataset.filter;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
      });
      groups.forEach((g) => {
        const show = target === "all" || g.dataset.cat === target;
        g.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Reveal on scroll
  const reveals = document.querySelectorAll(
    ".about, .menu__group, .offer, .visit__copy, .visit__map, .section-head"
  );
  reveals.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
})();
