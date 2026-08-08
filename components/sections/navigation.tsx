import { content } from '@/lib/content';
import { IconeLune, IconeSoleil, IconeTelephone, MarqueSoleil } from '@/components/icones';

// En-tête collant : marque, bascule de thème, bouton burger et menu principal.
// Le comportement (ouverture du menu, mémorisation du thème) vit dans
// `components/comportements.tsx`, qui retrouve ces éléments par leur id.

export function Navigation() {
  const { nav, business } = content;

  return (
    <header className="nav" id="top">
      <div className="container nav__inner">
        <a className="brand" href="#top" aria-label={nav.accueilAria}>
          <span className="brand__mark" aria-hidden="true">
            <MarqueSoleil gradientId="sun" trait="#0a0a0a" />
          </span>
          <span className="brand__name">
            {business.name}
            <small>{business.baseline}</small>
          </span>
        </a>

        <nav aria-label={nav.ariaLabel}>
          <button
            className="theme-toggle"
            type="button"
            id="themeToggle"
            aria-label={nav.themeAria}
            title={nav.themeTitre}
          >
            <IconeSoleil />
            <IconeLune />
          </button>
          <button className="nav__toggle" type="button" aria-controls="primary-menu" aria-expanded="false" id="navToggle">
            <span className="sr-only">{nav.ouvrirMenu}</span>
            <span className="nav__toggle-bars" aria-hidden="true"></span>
          </button>
          <ul className="nav__menu" id="primary-menu">
            {nav.items.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <a className="btn btn--primary btn--sm" href={business.telephoneLien}>
                <IconeTelephone />
                {business.telephone}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
