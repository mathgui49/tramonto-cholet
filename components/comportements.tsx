'use client';

import { useEffect } from 'react';

// ════════════════════════════════════════════════════════════════
// Comportements de la vitrine, portés tels quels depuis l'ancien `script.js`
// du site statique : année du pied de page, bascule de thème mémorisée,
// menu mobile, filtres de la carte avec leurs compteurs, apparition au
// défilement, parallaxe sur la photo de façade, et visionneuse de la galerie.
//
// Le code manipule le DOM directement, exactement comme avant : c'est ce qui
// garantit un rendu et des interactions identiques à la version en production.
// Aucun de ces comportements n'a d'état React, d'où l'unique `useEffect`.
// ════════════════════════════════════════════════════════════════

export function Comportements() {
  useEffect(() => {
    const menage: (() => void)[] = [];

    // Année du pied de page
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Bascule de thème (mémorisée dans localStorage)
    const themeToggle = document.getElementById('themeToggle');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const appliquerTheme = (theme: string) => {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeMeta) themeMeta.setAttribute('content', '#0e0805');
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeMeta) themeMeta.setAttribute('content', '#f6ecd9');
      }
    };
    if (themeToggle) {
      const surClicTheme = () => {
        const sombre = document.documentElement.getAttribute('data-theme') === 'dark';
        const suivant = sombre ? 'light' : 'dark';
        appliquerTheme(suivant);
        try {
          localStorage.setItem('tramonto-theme', suivant);
        } catch {
          /* stockage refusé (navigation privée) : le thème vaut pour la session */
        }
      };
      themeToggle.addEventListener('click', surClicTheme);
      menage.push(() => themeToggle.removeEventListener('click', surClicTheme));
    }

    // Navigation mobile
    const nav = document.querySelector('.nav');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('primary-menu');

    if (nav && toggle && menu) {
      const fermer = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };
      const ouvrir = () => {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      };

      const surClicToggle = () => {
        if (nav.classList.contains('is-open')) fermer();
        else ouvrir();
      };
      toggle.addEventListener('click', surClicToggle);
      menage.push(() => toggle.removeEventListener('click', surClicToggle));

      const surClicLien = () => {
        if (window.matchMedia('(max-width: 760px)').matches) fermer();
      };
      const liens = Array.from(menu.querySelectorAll('a'));
      liens.forEach((a) => a.addEventListener('click', surClicLien));
      menage.push(() => liens.forEach((a) => a.removeEventListener('click', surClicLien)));

      const surRedimension = () => {
        if (!window.matchMedia('(max-width: 760px)').matches) fermer();
      };
      window.addEventListener('resize', surRedimension);
      menage.push(() => window.removeEventListener('resize', surRedimension));

      const surEchap = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) fermer();
      };
      document.addEventListener('keydown', surEchap);
      menage.push(() => document.removeEventListener('keydown', surEchap));
    }

    // Filtres de la carte, avec compteurs calculés en direct
    const chips = Array.from(document.querySelectorAll<HTMLElement>('.chip[data-filter]'));
    const groupes = Array.from(document.querySelectorAll<HTMLElement>('.menu__group[data-cat]'));

    const comptes: Record<string, number> = { all: 0 };
    groupes.forEach((g) => {
      const cat = g.dataset.cat;
      if (!cat) return;
      const n = g.querySelectorAll('.dish').length;
      comptes[cat] = (comptes[cat] || 0) + n;
      comptes.all += n;
    });
    chips.forEach((chip) => {
      const filtre = chip.dataset.filter;
      const n = filtre ? comptes[filtre] : undefined;
      if (typeof n === 'number' && !chip.querySelector('.chip__count')) {
        const span = document.createElement('span');
        span.className = 'chip__count';
        span.textContent = String(n);
        chip.appendChild(span);
      }
    });

    const surClicChip = (chip: HTMLElement) => () => {
      const cible = chip.dataset.filter;
      chips.forEach((c) => {
        const actif = c === chip;
        c.classList.toggle('is-active', actif);
        c.setAttribute('aria-selected', String(actif));
      });
      groupes.forEach((g) => {
        const montrer = cible === 'all' || g.dataset.cat === cible;
        g.classList.toggle('is-hidden', !montrer);
      });
    };
    const ecouteursChips = chips.map((chip) => {
      const h = surClicChip(chip);
      chip.addEventListener('click', h);
      return () => chip.removeEventListener('click', h);
    });
    menage.push(() => ecouteursChips.forEach((f) => f()));

    // Apparition au défilement
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.about, .menu__group, .offer, .visit__copy, .visit__map, .section-head, .review',
      ),
    );
    reveals.forEach((el) => el.classList.add('reveal'));

    let observateurReveal: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observateurReveal = new IntersectionObserver(
        (entrees, io) => {
          entrees.forEach((entree) => {
            if (entree.isIntersecting) {
              entree.target.classList.add('is-visible');
              io.unobserve(entree.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      reveals.forEach((el) => observateurReveal?.observe(el));
      menage.push(() => observateurReveal?.disconnect());
    } else {
      reveals.forEach((el) => el.classList.add('is-visible'));
    }

    // Parallaxe sur la photo de façade
    const aboutImg = document.querySelector<HTMLImageElement>('.about__media img');
    if (
      aboutImg &&
      'IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      let visible = false;
      let planifie = false;

      const majParallaxe = () => {
        planifie = false;
        const rect = aboutImg.getBoundingClientRect();
        const vh = window.innerHeight;
        const centre = rect.top + rect.height / 2;
        const ecart = (centre - vh / 2) / vh;
        const decalage = Math.max(-22, Math.min(22, -ecart * 36));
        aboutImg.style.transform = `translate3d(0, ${decalage}px, 0) scale(1.08)`;
      };

      const surDefilement = () => {
        if (!visible || planifie) return;
        planifie = true;
        requestAnimationFrame(majParallaxe);
      };

      const observateurParallaxe = new IntersectionObserver(
        (entrees) => {
          entrees.forEach((e) => {
            visible = e.isIntersecting;
            if (visible) majParallaxe();
          });
        },
        { threshold: 0 },
      );
      observateurParallaxe.observe(aboutImg);
      window.addEventListener('scroll', surDefilement, { passive: true });
      menage.push(() => {
        observateurParallaxe.disconnect();
        window.removeEventListener('scroll', surDefilement);
      });
    }

    // Visionneuse de la galerie
    const lightbox = document.getElementById('lightbox') as HTMLDialogElement | null;
    const photos = Array.from(document.querySelectorAll<HTMLElement>('.gallery__item'));

    if (lightbox && photos.length && typeof lightbox.showModal === 'function') {
      const lbImg = lightbox.querySelector<HTMLImageElement>('.lightbox__img');
      const lbCap = lightbox.querySelector<HTMLElement>('.lightbox__caption');
      const boutonFermer = lightbox.querySelector<HTMLButtonElement>('.lightbox__close');
      const boutonPrec = lightbox.querySelector<HTMLButtonElement>('.lightbox__nav--prev');
      const boutonSuiv = lightbox.querySelector<HTMLButtonElement>('.lightbox__nav--next');

      if (lbImg && lbCap && boutonFermer && boutonPrec && boutonSuiv) {
        let index = 0;

        const afficher = (i: number) => {
          index = (i + photos.length) % photos.length;
          const figure = photos[index];
          const img = figure.querySelector('img');
          const legende = figure.querySelector('figcaption');
          if (!img) return;
          lbImg.src = img.src;
          lbImg.alt = img.alt || '';
          lbCap.textContent = legende ? legende.textContent : '';
        };

        const ouvrirA = (i: number) => {
          afficher(i);
          lightbox.showModal();
        };
        const fermer = () => lightbox.close();

        const ecouteursPhotos: (() => void)[] = [];
        photos.forEach((figure, i) => {
          figure.setAttribute('role', 'button');
          figure.setAttribute('tabindex', '0');
          figure.setAttribute('aria-label', 'Agrandir la photo');
          const surClic = () => ouvrirA(i);
          const surTouche = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              ouvrirA(i);
            }
          };
          figure.addEventListener('click', surClic);
          figure.addEventListener('keydown', surTouche);
          ecouteursPhotos.push(() => {
            figure.removeEventListener('click', surClic);
            figure.removeEventListener('keydown', surTouche);
          });
        });
        menage.push(() => ecouteursPhotos.forEach((f) => f()));

        const surPrec = () => afficher(index - 1);
        const surSuiv = () => afficher(index + 1);
        boutonFermer.addEventListener('click', fermer);
        boutonPrec.addEventListener('click', surPrec);
        boutonSuiv.addEventListener('click', surSuiv);
        menage.push(() => {
          boutonFermer.removeEventListener('click', fermer);
          boutonPrec.removeEventListener('click', surPrec);
          boutonSuiv.removeEventListener('click', surSuiv);
        });

        // Un clic sur le fond referme
        const surClicFond = (e: MouseEvent) => {
          const r = lbImg.getBoundingClientRect();
          const surImage =
            e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (e.target === lightbox && !surImage) fermer();
        };
        lightbox.addEventListener('click', surClicFond);
        menage.push(() => lightbox.removeEventListener('click', surClicFond));

        const surFleches = (e: KeyboardEvent) => {
          if (!lightbox.open) return;
          if (e.key === 'ArrowLeft') afficher(index - 1);
          else if (e.key === 'ArrowRight') afficher(index + 1);
        };
        document.addEventListener('keydown', surFleches);
        menage.push(() => document.removeEventListener('keydown', surFleches));
      }
    }

    return () => menage.forEach((f) => f());
  }, []);

  return null;
}
