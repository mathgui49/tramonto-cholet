import { content } from '@/lib/content';

// ════════════════════════════════════════════════════════════════
// Données structurées schema.org (Restaurant + Menu), reconstruites à partir
// de `content.json` plutôt que recopiées à la main : quand le patron corrige
// un tarif ou renomme une pizza depuis l'éditeur, Google voit la même chose
// que le visiteur. C'est le seul endroit où les prix affichés (« 9,90 € »)
// sont retraduits en nombres.
// ════════════════════════════════════════════════════════════════

const JOURS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** « 12,50 € » ou « / 20,90 € » → « 12.50 ». */
function montant(libelle: string): string {
  const trouve = libelle.match(/(\d+)[.,](\d{2})/);
  if (trouve) return `${trouve[1]}.${trouve[2]}`;
  const entier = libelle.match(/(\d+)/);
  return entier ? `${entier[1]}.00` : '0.00';
}

export function donneesStructurees(): Record<string, unknown> {
  const { business, seo, menu } = content;
  const base = seo.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${base}/#restaurant`,
    name: business.nomComplet,
    description: seo.descriptionStructuree,
    url: `${base}/`,
    image: [
      `${base}${seo.ogImage}`,
      `${base}${content.about.image.src}`,
      `${base}${content.gallery.items[0].src}`,
    ],
    logo: `${base}/icon-512.png`,
    telephone: business.telephoneLien.replace('tel:', ''),
    priceRange: business.gammeDePrix,
    servesCuisine: business.cuisines,
    menu: `${base}/#menu`,
    acceptsReservations: 'True',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.adresse,
      addressLocality: business.ville,
      postalCode: business.codePostal,
      addressRegion: business.region,
      addressCountry: business.pays,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.latitude,
      longitude: business.longitude,
    },
    openingHoursSpecification: business.horaires.map((plage) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: JOURS,
      opens: plage.ouverture,
      closes: plage.fermeture,
    })),
    hasMenu: {
      '@type': 'Menu',
      name: `Carte ${business.name}`,
      inLanguage: 'fr-FR',
      hasMenuSection: menu.groupes.map((groupe) => ({
        '@type': 'MenuSection',
        name: groupe.title,
        description: groupe.formats,
        hasMenuItem: groupe.items.map((plat) => {
          const nom = plat.precision ? `${plat.name} ${plat.precision}` : plat.name;
          const offres = plat.prixGrande
            ? [
                { '@type': 'Offer', price: montant(plat.prix), priceCurrency: 'EUR', name: 'Moyenne' },
                { '@type': 'Offer', price: montant(plat.prixGrande), priceCurrency: 'EUR', name: 'Grande' },
              ]
            : { '@type': 'Offer', price: montant(plat.prix), priceCurrency: 'EUR' };
          return {
            '@type': 'MenuItem',
            name: nom,
            description: plat.description,
            ...(plat.vegetarien ? { suitableForDiet: 'https://schema.org/VegetarianDiet' } : {}),
            offers: offres,
          };
        }),
      })),
    },
    potentialAction: [
      {
        '@type': 'OrderAction',
        name: 'Commander en livraison',
        target: business.ubereats,
        deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
      },
      {
        '@type': 'ReserveAction',
        name: 'Réserver par téléphone',
        target: business.telephoneLien,
      },
    ],
    sameAs: [business.ubereats],
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude,
        longitude: business.longitude,
      },
      geoRadius: 5000,
    },
  };
}

/**
 * Sérialisation sûre pour une balise <script> : `<` est échappé pour qu'aucune
 * valeur de contenu ne puisse refermer la balise et injecter du balisage.
 */
export function donneesStructureesJSON(): string {
  return JSON.stringify(donneesStructurees()).replace(/</g, '\\u003c');
}
