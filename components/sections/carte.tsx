import { content } from '@/lib/content';
import type { Plat } from '@/lib/content';

// La carte : filtres par catégorie (les compteurs sont ajoutés à l'exécution
// par `comportements.tsx`) puis un groupe par famille de plats.
//
// Chaque plat est un <article> : c'est ce qui permet à l'éditeur Scalenvia de
// saisir la bonne carte lorsqu'on réordonne une liste au glisser-déposer.

function Dish({ plat, misEnAvant }: { plat: Plat; misEnAvant: boolean }) {
  return (
    <article className={misEnAvant ? 'dish dish--feat' : 'dish'}>
      <div className="dish__top">
        {/* Nom et tarif sont assemblés en une seule expression pour ne produire
            qu'un nœud texte, comme dans le HTML d'origine : un <span>
            intercalaire décalerait la suite de la ligne d'un pixel. */}
        <h4 className="dish__name">
          {plat.precision ? (
            <>
              {`${plat.name} `}
              <small>{plat.precision}</small>
            </>
          ) : (
            plat.name
          )}
        </h4>
        <span className="dish__price">
          {plat.prixGrande ? (
            <>
              {`${plat.prix} `}
              <em>{plat.prixGrande}</em>
            </>
          ) : (
            plat.prix
          )}
        </span>
      </div>
      <p className="dish__desc">{plat.description}</p>
      {plat.etiquette ? <span className="dish__tag">{plat.etiquette}</span> : null}
    </article>
  );
}

export function Carte() {
  const { menu } = content;

  return (
    <section className="menu" id="menu">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">{menu.eyebrow}</span>
          <h2>{menu.title}</h2>
          <p>{menu.intro}</p>
          <div className="menu__filters" role="tablist" aria-label={menu.filtresAria}>
            {menu.filtres.map((filtre, i) => (
              <button
                key={filtre.categorie}
                className={i === 0 ? 'chip is-active' : 'chip'}
                role="tab"
                aria-selected={i === 0 ? 'true' : 'false'}
                data-filter={filtre.categorie}
              >
                {filtre.label}
              </button>
            ))}
          </div>
        </header>

        {menu.groupes.map((groupe) => (
          <article className="menu__group" data-cat={groupe.categorie} key={groupe.categorie}>
            <header className="menu__head">
              <h3>{groupe.title}</h3>
              <span className="menu__sizes">{groupe.formats}</span>
            </header>
            <div className={groupe.misEnAvant ? 'menu__list menu__list--featured' : 'menu__list'}>
              {groupe.items.map((plat) => (
                <Dish key={plat.name} plat={plat} misEnAvant={groupe.misEnAvant} />
              ))}
            </div>
          </article>
        ))}

        <p className="menu__note">{menu.note}</p>
      </div>
    </section>
  );
}
