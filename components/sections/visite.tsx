import { Fragment } from 'react';
import { content } from '@/lib/content';
import { ICONES_VISITE, MarqueUberEats } from '@/components/icones';

// « Nous trouver » : adresse, téléphone, horaires, livraison et certification,
// puis le plan Google en iframe.

export function Visite() {
  const { visit, business } = content;

  return (
    <section className="visit" id="visit">
      <div className="container visit__grid">
        <div className="visit__copy">
          <span className="eyebrow">{visit.eyebrow}</span>
          {/* Même règle que le titre du bandeau d'ouverture : des lignes nues,
              séparées par un <br>, pour un interligne serré qui tient quand le
              texte s'allonge. */}
          <h2>
            {visit.title.map((ligne, i) => (
              <Fragment key={ligne}>
                {i > 0 ? <br /> : null}
                {ligne}
              </Fragment>
            ))}
          </h2>
          <p>
            {`${visit.intro} `}
            <strong>{visit.introFort}</strong>
            {` ${visit.introSuite}`}
          </p>

          <ul className="visit__info">
            {visit.info.map((item) => (
              <li key={item.title}>
                <span className="visit__icn" aria-hidden="true">
                  {ICONES_VISITE[item.icone]}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  {item.lignes.map((ligne) =>
                    item.lienTelephone ? (
                      <a href={business.telephoneLien} key={ligne}>
                        {ligne}
                      </a>
                    ) : (
                      <span key={ligne}>{ligne}</span>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="visit__cta">
            <a className="btn btn--primary" href={business.telephoneLien}>
              {visit.ctaAppel}
            </a>
            <a className="btn btn--ubereats" href={business.ubereats} target="_blank" rel="noreferrer noopener">
              <MarqueUberEats />
              <span className="ue-cta">{visit.ctaUbereats}</span>
            </a>
            <a className="btn btn--ghost" href={business.itineraire} target="_blank" rel="noreferrer noopener">
              {visit.ctaItineraire}
            </a>
          </div>
        </div>

        <div className="visit__map">
          <iframe
            title={business.planTitre}
            src={business.planIntegre}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
