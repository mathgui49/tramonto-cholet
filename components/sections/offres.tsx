import { content } from '@/lib/content';
import { texteAvecOrdinaux } from '@/components/typographie';

// Les deux formules à emporter. La seconde est la carte « pleine » orange :
// c'est le drapeau `sombre` du contenu qui la désigne, pas sa position.

export function Offres() {
  const { offers, business } = content;

  return (
    <section className="offers" id="offers">
      <div className="container">
        <header className="section-head section-head--light">
          <span className="eyebrow">{offers.eyebrow}</span>
          <h2>{offers.title}</h2>
          <p>{offers.intro}</p>
        </header>

        <div className="offers__grid">
          {offers.items.map((offre) => (
            <article className={offre.sombre ? 'offer offer--dark' : 'offer'} key={offre.title}>
              <div className="offer__badge">{offre.chapeau}</div>
              <h3>{offre.title}</h3>
              <p className="offer__desc">{offre.description}</p>
              <ul className="offer__list">
                {offre.points.map((point) => (
                  <li key={point}>{texteAvecOrdinaux(point)}</li>
                ))}
              </ul>
              <a
                className={offre.sombre ? 'btn btn--ghost btn--block' : 'btn btn--primary btn--block'}
                href={business.telephoneLien}
              >
                {offre.ctaLabel}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
