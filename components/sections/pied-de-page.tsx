import { Fragment } from 'react';
import { content } from '@/lib/content';
import { MarqueSoleil, MarqueUberEats } from '@/components/icones';
import { IconeTelephone } from '@/components/icones';

// Pied de page, puis la barre d'appel collée en bas d'écran sur mobile.
// L'année des mentions est renseignée à l'exécution par `comportements.tsx`,
// comme sur la version d'origine : elle ne se fige donc pas au déploiement.

export function PiedDePage() {
  const { footer, business } = content;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true">
              <MarqueSoleil gradientId="sun2" trait="#f5e6d3" />
            </span>
            <span className="brand__name">
              {business.name}
              <small>{business.baseline}</small>
            </span>
          </span>
          <p>{footer.description}</p>
        </div>

        {footer.colonnes.map((colonne) => (
          <div key={colonne.title}>
            <h3>{colonne.title}</h3>
            <p>
              {colonne.lignes.map((ligne, i) => (
                <Fragment key={ligne.texte}>
                  {i > 0 ? <br /> : null}
                  {ligne.href ? <a href={ligne.href}>{ligne.texte}</a> : <span>{ligne.texte}</span>}
                </Fragment>
              ))}
            </p>
          </div>
        ))}
      </div>

      <div className="container footer__bottom">
        <small>
          {'© '}
          <span id="year"></span>
          {` ${footer.mentions}`}
        </small>
        <small>{footer.signature}</small>
      </div>
    </footer>
  );
}

export function BarreMobile() {
  const { barreMobile, business } = content;

  return (
    <div className="mobile-bar" role="region" aria-label={barreMobile.ariaLabel}>
      <a
        className="mobile-bar__btn mobile-bar__btn--call"
        href={business.telephoneLien}
        aria-label={barreMobile.appelAria}
      >
        <IconeTelephone />
        <span>{barreMobile.appelLabel}</span>
      </a>
      <a
        className="mobile-bar__btn mobile-bar__btn--ue"
        href={business.ubereats}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={barreMobile.commandeAria}
      >
        <MarqueUberEats />
        <span>{barreMobile.commandeLabel}</span>
      </a>
    </div>
  );
}
