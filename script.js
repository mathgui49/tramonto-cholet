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

  // Menu filters with live counts
  const chips = document.querySelectorAll(".chip[data-filter]");
  const groups = document.querySelectorAll(".menu__group[data-cat]");

  // Compute counts per filter and inject .chip__count
  const counts = { all: 0 };
  groups.forEach((g) => {
    const c = g.querySelectorAll(".dish").length;
    counts[g.dataset.cat] = (counts[g.dataset.cat] || 0) + c;
    counts.all += c;
  });
  chips.forEach((chip) => {
    const n = counts[chip.dataset.filter];
    if (typeof n === "number") {
      const span = document.createElement("span");
      span.className = "chip__count";
      span.textContent = n;
      chip.appendChild(span);
    }
  });

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
    ".about, .menu__group, .offer, .visit__copy, .visit__map, .section-head, .review"
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

  // Parallax on about photo
  const aboutImg = document.querySelector(".about__media img");
  if (
    aboutImg &&
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    let inView = false;
    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = aboutImg.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) / vh;
      const shift = Math.max(-22, Math.min(22, -offset * 36));
      aboutImg.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
    };

    const onScroll = () => {
      if (!inView || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          inView = e.isIntersecting;
          if (inView) update();
        });
      },
      { threshold: 0 }
    ).observe(aboutImg);

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Lightbox for gallery
  const lightbox = document.getElementById("lightbox");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));

  if (lightbox && galleryItems.length && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector(".lightbox__img");
    const lbCap = lightbox.querySelector(".lightbox__caption");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    const nextBtn = lightbox.querySelector(".lightbox__nav--next");

    let currentIndex = 0;

    const renderAt = (i) => {
      currentIndex = (i + galleryItems.length) % galleryItems.length;
      const fig = galleryItems[currentIndex];
      const img = fig.querySelector("img");
      const cap = fig.querySelector("figcaption");
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbCap.textContent = cap ? cap.textContent : "";
    };

    const openAt = (i) => {
      renderAt(i);
      lightbox.showModal();
    };

    const close = () => lightbox.close();

    galleryItems.forEach((fig, i) => {
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("aria-label", "Agrandir la photo");
      fig.addEventListener("click", () => openAt(i));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openAt(i);
        }
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => renderAt(currentIndex - 1));
    nextBtn.addEventListener("click", () => renderAt(currentIndex + 1));

    // Click on backdrop closes
    lightbox.addEventListener("click", (e) => {
      const r = lbImg.getBoundingClientRect();
      const insideImg =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom;
      const target = e.target;
      if (
        target === lightbox &&
        !insideImg
      ) close();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.open) return;
      if (e.key === "ArrowLeft") renderAt(currentIndex - 1);
      else if (e.key === "ArrowRight") renderAt(currentIndex + 1);
    });
  }
})();
