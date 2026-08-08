import { content } from '@/lib/content';

// « La maison » : la photo de façade (animée en parallaxe par
// `comportements.tsx`) et le propos de la pizzeria.

export function APropos() {
  const { about } = content;

  return (
    <section className="about" id="about">
      <div className="container about__grid">
        <div className="about__media">
          <picture>
            <source srcSet={about.image.webp} type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={about.image.src}
              alt={about.image.alt}
              loading="lazy"
              width={about.image.largeur}
              height={about.image.hauteur}
            />
          </picture>
          <div className="about__media-tint" aria-hidden="true"></div>
          <div className="about__card" aria-hidden="true">
            <span className="about__chip">{about.carte.chapeau}</span>
            <span className="about__title">{about.carte.title}</span>
            <span className="about__sub">{about.carte.description}</span>
            <span className="about__flame"></span>
          </div>
        </div>
        <div className="about__copy">
          <span className="eyebrow">{about.eyebrow}</span>
          <h2>{about.title}</h2>
          {/* Le texte est concaténé dans une seule expression plutôt que posé
              à côté du <em> : on retrouve exactement les deux nœuds du DOM
              d'origine, donc la même justification au pixel près. */}
          <p>
            <em>{about.emphase}</em>
            {` ${about.texte}`}
          </p>
          {/* Le libellé reste un nœud texte nu : `.about__points span` habille
              la puce, l'envelopper d'un span le colorerait comme elle. */}
          <ul className="about__points">
            {about.points.map((point) => (
              <li key={point}>
                <span aria-hidden="true">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
