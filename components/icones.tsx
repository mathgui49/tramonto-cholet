import type { JSX } from 'react';

// ════════════════════════════════════════════════════════════════
// Les pictogrammes du site, repris trait pour trait de l'ancien index.html.
// Ils font partie du dessin, pas du contenu : ils ne passent donc pas par
// `content.json`. Les sections y font référence par leur nom.
// ════════════════════════════════════════════════════════════════

/** Le soleil couchant de la marque. `gradientId` doit rester unique par page. */
export function MarqueSoleil({ gradientId, trait }: { gradientId: string; trait: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="20" r="10" fill={`url(#${gradientId})`} />
      <path d="M2 22h28" stroke={trait} strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id={gradientId} x1="6" y1="10" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffb347" />
          <stop offset="0.55" stopColor="#ff6b3d" />
          <stop offset="1" stopColor="#a01818" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IconeTelephone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1L6.6 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconeCarte() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h18v2H3zm0 4h18v2H3zm0 4h12v2H3z" fill="currentColor" />
    </svg>
  );
}

export function IconeSoleil() {
  return (
    <svg className="theme-toggle__sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M4.9 4.9l2.1 2.1" />
        <path d="M17 17l2.1 2.1" />
        <path d="M4.9 19.1l2.1-2.1" />
        <path d="M17 7l2.1-2.1" />
      </g>
    </svg>
  );
}

export function IconeLune() {
  return (
    <svg className="theme-toggle__moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M21 13.5A9 9 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  );
}

/** L'épi de blé de la pastille « 48 h de fermentation ». */
export function IconeEpi() {
  return (
    <svg
      className="hero__badge-icon"
      viewBox="0 0 32 32"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 30 V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 30 C 12 26 10 23 10 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M16 30 C 20 26 22 23 22 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="11.5" cy="9" rx="2" ry="3" fill="currentColor" transform="rotate(-25 11.5 9)" />
      <ellipse cx="20.5" cy="9" rx="2" ry="3" fill="currentColor" transform="rotate(25 20.5 9)" />
      <ellipse cx="10" cy="14" rx="2" ry="3" fill="currentColor" transform="rotate(-25 10 14)" />
      <ellipse cx="22" cy="14" rx="2" ry="3" fill="currentColor" transform="rotate(25 22 14)" />
      <ellipse cx="9" cy="19" rx="2" ry="3" fill="currentColor" transform="rotate(-25 9 19)" />
      <ellipse cx="23" cy="19" rx="2" ry="3" fill="currentColor" transform="rotate(25 23 19)" />
      <ellipse cx="16" cy="6" rx="1.6" ry="2.4" fill="currentColor" />
    </svg>
  );
}

/** Les pictogrammes de la section « Nous trouver », indexés par `icone`. */
export const ICONES_VISITE: Record<string, JSX.Element> = {
  lieu: (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 2a8 8 0 0 0-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 0 0-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        fill="currentColor"
      />
    </svg>
  ),
  telephone: (
    <svg viewBox="0 0 24 24">
      <path
        d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1L6.6 10.8Z"
        fill="currentColor"
      />
    </svg>
  ),
  horloge: (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 8v5l4 2 .8-1.4-3.3-1.9V8Zm0-6a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"
        fill="currentColor"
      />
    </svg>
  ),
  livraison: (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h13l-1.5-2H3v2Zm0 4h18v8H3Zm14 4a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z" fill="currentColor" />
    </svg>
  ),
  bouclier: (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 2 4 6v6c0 5 3.4 9.5 8 10 4.6-.5 8-5 8-10V6l-8-4Zm0 6 5 2.5V12c0 3.6-2.4 7-5 7.7-2.6-.7-5-4.1-5-7.7v-3.5L12 8Z"
        fill="currentColor"
      />
    </svg>
  ),
};

/** Le mot-symbole Uber Eats, tel qu'il est composé dans les boutons verts. */
export function MarqueUberEats() {
  return (
    <span className="ue-wordmark">
      <strong>Uber</strong> Eats
    </span>
  );
}
