import { Fragment } from 'react';
import { content } from '@/lib/content';
import { IconeCarte, IconeEpi, IconeTelephone, MarqueUberEats } from '@/components/icones';

// Bandeau d'ouverture : accroche, boutons d'appel et de commande, bandeau de
// trois arguments, et la photo ronde avec sa pastille de fermentation.

export function Hero() {
  const { hero, business } = content;

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <span className="hero__sun"></span>
        <span className="hero__glow hero__glow--a"></span>
        <span className="hero__glow hero__glow--b"></span>
      </div>
      <div className="container hero__inner">
        <div className="hero__copy">
          <span className="eyebrow">{hero.eyebrow}</span>
          {/* Les lignes du titre restent des nœuds texte nus, séparés par un
              <br> : dans un titre à interligne serré, les envelopper créerait
              deux boîtes qui se recouvrent dès que le texte s'allonge. */}
          <h1 className="hero__title">
            {hero.title.map((ligne, i) => (
              <Fragment key={ligne}>
                {i > 0 ? <br /> : null}
                {ligne}
              </Fragment>
            ))}
          </h1>
          <p className="hero__lead">{hero.intro}</p>
          <div className="hero__cta">
            <a className="btn btn--primary btn--lg btn--pulse" href={hero.cta.href}>
              <IconeCarte />
              {hero.cta.label}
            </a>
            <div className="hero__cta-secondary">
              <a
                className="btn btn--ubereats btn--sm"
                href={business.ubereats}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MarqueUberEats />
                <span className="ue-cta">{hero.ubereatsLabel}</span>
              </a>
              <a className="btn btn--ghost btn--sm" href={business.telephoneLien}>
                <IconeTelephone />
                {business.telephone}
              </a>
            </div>
          </div>
          <ul className="hero__strip">
            {hero.strip.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__visual">
          <span className="hero__visual-disc" aria-hidden="true"></span>
          <span className="hero__visual-spark hero__visual-spark--a" aria-hidden="true"></span>
          <span className="hero__visual-spark hero__visual-spark--b" aria-hidden="true"></span>
          <picture>
            <source srcSet={hero.image.webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero__photo"
              src={hero.image.src}
              alt={hero.image.alt}
              width={hero.image.largeur}
              height={hero.image.hauteur}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <span className="hero__badge" aria-hidden="true">
            <IconeEpi />
            <strong>{hero.badge.title}</strong>
            <small>{hero.badge.legende}</small>
          </span>
        </div>
      </div>
    </section>
  );
}
