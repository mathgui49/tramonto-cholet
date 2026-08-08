import { content } from '@/lib/content';

// Avis Google recopiés tels quels : ce sont de vrais avis, pas des exemples.

export function Avis() {
  const { reviews, business } = content;

  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">{reviews.eyebrow}</span>
          <h2>{reviews.title}</h2>
          <div className="reviews__rating" aria-label={reviews.noteAria}>
            <span className="reviews__stars" aria-hidden="true">
              {reviews.etoiles}
            </span>
            <strong>{reviews.note}</strong>
            <span className="reviews__count">{reviews.sousTitre}</span>
          </div>
        </header>

        <div className="reviews__grid">
          {reviews.items.map((avis) => (
            <article className="review" key={avis.name}>
              <div className="review__stars" aria-label={avis.etoilesAria}>
                {avis.etoiles}
              </div>
              <blockquote>{avis.texte}</blockquote>
              <footer className="review__author">
                <strong>{avis.name}</strong>
                <span>{avis.source}</span>
              </footer>
            </article>
          ))}
        </div>

        <div className="reviews__cta">
          <a className="btn btn--ghost" href={business.itineraire} target="_blank" rel="noreferrer noopener">
            {reviews.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}
