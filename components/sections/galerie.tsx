import { content } from '@/lib/content';

// Mosaïque de photos. Le format de chaque vignette (« xl », « wide », normal)
// vient du contenu : c'est lui qui décide de l'emprise dans la grille.
// L'agrandissement au clic est branché par `comportements.tsx`.

const CLASSES_FORMAT: Record<string, string> = {
  xl: 'gallery__item gallery__item--xl',
  wide: 'gallery__item gallery__item--wide',
};

export function Galerie() {
  const { gallery } = content;

  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">{gallery.eyebrow}</span>
          <h2>{gallery.title}</h2>
          <p>{gallery.intro}</p>
        </header>

        <div className="gallery__grid">
          {gallery.items.map((photo) => (
            <figure className={CLASSES_FORMAT[photo.format] ?? 'gallery__item'} key={photo.src}>
              <picture>
                <source srcSet={photo.webp} type="image/webp" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  width={photo.largeur}
                  height={photo.hauteur}
                />
              </picture>
              <figcaption>{photo.legende}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** La visionneuse, posée en fin de page comme dans la version d'origine. */
export function Visionneuse() {
  const { gallery } = content;

  return (
    <dialog className="lightbox" id="lightbox" aria-label={gallery.ariaLabel}>
      <button className="lightbox__close" type="button" aria-label={gallery.fermer}>
        ×
      </button>
      <button className="lightbox__nav lightbox__nav--prev" type="button" aria-label={gallery.precedente}>
        ‹
      </button>
      <button className="lightbox__nav lightbox__nav--next" type="button" aria-label={gallery.suivante}>
        ›
      </button>
      <figure className="lightbox__figure">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="lightbox__img" alt="" />
        <figcaption className="lightbox__caption"></figcaption>
      </figure>
    </dialog>
  );
}
