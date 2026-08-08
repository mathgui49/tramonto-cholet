import raw from '@/content.json';

// ════════════════════════════════════════════════════════════════
// Couche de contenu éditable — `content.json` est la SEULE source que le
// propriétaire de la pizzeria modifie, depuis l'éditeur du studio Scalenvia.
// Publier depuis l'éditeur = commit de ce fichier, puis redéploiement Vercel.
// Le reste (structure des sections, mise en page, feuille de style) reste figé.
//
// Toute valeur affichée par un composant vient d'ici : textes, chemins de
// photos avec leur `alt`, libellés de navigation, carte, horaires, tarifs,
// coordonnées, métadonnées de référencement et couleur de marque.
// ════════════════════════════════════════════════════════════════

export interface Lien {
  label: string;
  href: string;
}

export interface Image {
  src: string;
  webp: string;
  alt: string;
  largeur: number;
  hauteur: number;
}

export interface Plat {
  name: string;
  /** Précision de format affichée en petit à côté du nom, ex. « (penne) ». */
  precision?: string;
  prix: string;
  /** Tarif grand format, barre oblique comprise : c'est le libellé affiché. */
  prixGrande?: string;
  description: string;
  /** Étiquette des pizzas signature (« Signature », « ★ Best-seller »). */
  etiquette?: string;
  /** Renseigne le `suitableForDiet` des données structurées. */
  vegetarien?: boolean;
}

export interface GroupeMenu {
  title: string;
  categorie: string;
  formats: string;
  misEnAvant: boolean;
  items: Plat[];
}

export interface PhotoGalerie extends Image {
  legende: string;
  /** Gabarit dans la mosaïque : « xl », « wide » ou « normal ». */
  format: string;
}

export interface SiteContent {
  version: string;
  brand: { primary: string };
  business: {
    name: string;
    baseline: string;
    nomComplet: string;
    telephone: string;
    telephoneLien: string;
    email: string;
    adresse: string;
    codePostal: string;
    ville: string;
    region: string;
    pays: string;
    latitude: number;
    longitude: number;
    gammeDePrix: string;
    cuisines: string[];
    ubereats: string;
    itineraire: string;
    planIntegre: string;
    planTitre: string;
    horaires: { ouverture: string; fermeture: string }[];
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    url: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogImageAlt: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImageAlt: string;
    descriptionStructuree: string;
    themeColorClair: string;
    themeColorSombre: string;
  };
  nav: {
    ariaLabel: string;
    accueilAria: string;
    lienEvitement: string;
    ouvrirMenu: string;
    themeAria: string;
    themeTitre: string;
    items: Lien[];
  };
  hero: {
    eyebrow: string;
    title: string[];
    intro: string;
    cta: Lien;
    ubereatsLabel: string;
    image: Image;
    badge: { title: string; legende: string };
    strip: { title: string; description: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    emphase: string;
    texte: string;
    image: Image;
    carte: { chapeau: string; title: string; description: string };
    points: string[];
  };
  menu: {
    eyebrow: string;
    title: string;
    intro: string;
    filtresAria: string;
    note: string;
    filtres: { label: string; categorie: string }[];
    groupes: GroupeMenu[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    intro: string;
    ariaLabel: string;
    agrandir: string;
    fermer: string;
    precedente: string;
    suivante: string;
    items: PhotoGalerie[];
  };
  reviews: {
    eyebrow: string;
    title: string;
    noteAria: string;
    etoiles: string;
    note: string;
    sousTitre: string;
    cta: { label: string };
    items: {
      name: string;
      texte: string;
      source: string;
      etoiles: string;
      etoilesAria: string;
    }[];
  };
  offers: {
    eyebrow: string;
    title: string;
    intro: string;
    items: {
      title: string;
      chapeau: string;
      description: string;
      sombre: boolean;
      ctaLabel: string;
      points: string[];
    }[];
  };
  visit: {
    eyebrow: string;
    title: string[];
    intro: string;
    introFort: string;
    introSuite: string;
    ctaAppel: string;
    ctaUbereats: string;
    ctaItineraire: string;
    info: {
      title: string;
      icone: string;
      lignes: string[];
      lienTelephone?: boolean;
    }[];
  };
  footer: {
    description: string;
    colonnes: { title: string; lignes: { texte: string; href?: string }[] }[];
    mentions: string;
    signature: string;
  };
  barreMobile: {
    ariaLabel: string;
    appelLabel: string;
    appelAria: string;
    commandeLabel: string;
    commandeAria: string;
  };
  pageIntrouvable: {
    title: string;
    code: string;
    titre: string;
    texte: string;
    ctaAccueil: Lien;
    ctaCarte: Lien;
  };
}

export const content = raw as SiteContent;

// ─── Couleur de marque → variables CSS ────────────────────────────
// `content.brand.primary` pilote `--c-accent` et ses deux dérivées, déjà
// déclarées dans `app/globals.css` : la version claire sert aux survols de
// liens, la version foncée est tenue en réserve pour les états pressés.

function borner(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function lireHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const complet = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(complet.slice(0, 2), 16) || 0,
    parseInt(complet.slice(2, 4), 16) || 0,
    parseInt(complet.slice(4, 6), 16) || 0,
  ];
}

function versHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((n) => borner(n).toString(16).padStart(2, '0')).join('');
}

/** Assombrit une couleur (quantite 0→1). */
function assombrir(hex: string, quantite: number): string {
  const [r, g, b] = lireHex(hex);
  return versHex([r * (1 - quantite), g * (1 - quantite), b * (1 - quantite)]);
}

/** Éclaircit une couleur en la mélangeant vers le blanc (quantite 0→1). */
function eclaircir(hex: string, quantite: number): string {
  const [r, g, b] = lireHex(hex);
  return versHex([
    r + (255 - r) * quantite,
    g + (255 - g) * quantite,
    b + (255 - b) * quantite,
  ]);
}

/**
 * Variables CSS de marque dérivées d'une couleur principale donnée. Extrait
 * pour être réutilisable à chaud (aperçu live de l'éditeur : cf PreviewBridge)
 * sans dépendre du content.json figé au build. Les noms correspondent à ceux
 * déclarés dans `app/globals.css`.
 */
export function brandVarsFor(primary: string): Record<string, string> {
  return {
    '--c-accent': primary,
    '--c-accent-2': eclaircir(primary, 0.2),
    '--c-accent-3': assombrir(primary, 0.16),
  };
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Même calcul, mais à partir d'une palette partielle. C'est la porte d'entrée
 * de l'aperçu de l'éditeur : le brouillon arrive d'une saisie libre, où
 * « #ab » existe le temps de taper la suite, donc toute valeur qui n'est pas
 * un hexadécimal valide est ignorée plutôt que de repeindre le site en noir.
 */
export function brandVarsFrom(brand: Partial<SiteContent['brand']>): Record<string, string> {
  const primary = brand.primary;
  if (typeof primary !== 'string' || !HEX_RE.test(primary.trim())) return {};
  return brandVarsFor(primary.trim());
}

/**
 * Variables CSS de marque à poser en style inline sur <html> — un style inline
 * l'emporte sur la règle `:root` de globals.css quel que soit l'ordre
 * d'injection, ce qui est précisément pourquoi il est posé là et pas ailleurs.
 */
export function brandVars(): Record<string, string> {
  return brandVarsFor(content.brand.primary);
}
