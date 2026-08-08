'use client';

import { useEffect } from 'react';
import { brandVarsFrom } from '@/lib/content';

// ════════════════════════════════════════════════════════════════
// Aperçu live de l'éditeur Scalenvia.
//
// Quand ce site est affiché DANS l'éditeur du portail (dans une <iframe>),
// l'éditeur envoie le brouillon en cours par postMessage, à chaque frappe, et
// ce pont le rend visible sans rien reconstruire :
//   · les COULEURS de marque, en recalculant les mêmes variables CSS que le
//     site publié (via brandVarsFrom, la fonction que layout.tsx utilise) ;
//   · les IMAGES remplacées, dont l'éditeur envoie les octets en data URL
//     puisqu'elles ne sont pas encore déployées ;
//   · les TEXTES modifiés, en remplaçant le nœud texte correspondant.
//
// Il rend aussi la page MANIPULABLE, selon l'outil choisi dans le portail :
//   · « Désigner » — un clic sur un texte ouvre son champ dans le formulaire ;
//   · « Écrire »   — un clic pose le curseur dans la page et on tape ; chaque
//                    frappe remonte à l'éditeur, qui met le champ à jour ;
//   · dans les deux, les listes se RÉORDONNENT au glisser-déposer.
//
// GARDES DE SÉCURITÉ :
//   · ne fait rien si la page n'est pas embarquée (window.parent === window),
//     donc jamais pour un vrai visiteur ;
//   · n'accepte que les messages venant d'une origine Scalenvia connue ;
//   · ne touche qu'à des variables CSS, des attributs src en data:image et des
//     nœuds texte. Rien de ce qui est reçu n'est exécuté ni interprété comme
//     du HTML : on écrit `textContent`, jamais `innerHTML` ;
//   · l'édition directe est en `plaintext-only` : ni balise, ni style collé.
//
// Le site publié reste la vérité : ce pont ne modifie que l'affichage de
// l'onglet en cours, et tout disparaît au rechargement.
// ════════════════════════════════════════════════════════════════

// ─── Contrat partagé avec le studio (lib/editeur/pont-protocole.ts) ───
// Recopié plutôt qu'importé : les deux vivent dans deux dépôts. Côté studio,
// un test vérifie que ces noms n'ont pas divergé.
const VERS_SITE = 'scalenvia:preview';
const SITE_PRET = 'scalenvia:preview-ready';
const SITE_DESIGNE = 'scalenvia:preview-pick';
const SITE_EDITE = 'scalenvia:preview-edit';
const SITE_DEPLACE = 'scalenvia:preview-move';
const SITE_TITRES = 'scalenvia:preview-headings';
const SITE_ACTION_LISTE = 'scalenvia:preview-item-action';
const LONGUEUR_ANCRE_MIN = 3;

type Outil = 'aucun' | 'designation' | 'edition';
interface ListeDesignable { chemin: string; ancres: string[] }

const ORIGINES_AUTORISEES = [
  'https://scalenvia.com',
  'https://www.scalenvia.com',
  'http://localhost:3000',
];

/** Les déploiements de préversion du studio (scalenvia-*.vercel.app). */
function origineAutorisee(origine: string): boolean {
  if (ORIGINES_AUTORISEES.includes(origine)) return true;
  try {
    const u = new URL(origine);
    return u.protocol === 'https:' && u.hostname.endsWith('.vercel.app') && u.hostname.startsWith('scalenvia');
  } catch {
    return false;
  }
}

/**
 * Remplace en direct les <img> dont le chemin correspond à une image éditée,
 * par son aperçu. Gère les <img> classiques ET next/image, dont le vrai chemin
 * est encodé dans le paramètre `url=` de l'optimiseur. Uniquement des
 * data:image — une URL arbitraire venue du message ne doit jamais être chargée.
 */
function appliquerImages(images: Record<string, unknown>): void {
  const paires = Object.entries(images).filter(
    ([chemin, url]) => typeof chemin === 'string' && typeof url === 'string' && url.startsWith('data:image/'),
  ) as [string, string][];
  if (paires.length === 0) return;

  const balises = Array.from(document.querySelectorAll('img'));
  for (const [ancien, dataUrl] of paires) {
    for (const img of balises) {
      const src = img.getAttribute('src') || '';
      let correspond = src.includes(ancien) || (img.currentSrc || '').includes(ancien);
      if (!correspond && src) {
        try {
          const interne = new URL(src, window.location.href).searchParams.get('url');
          if (interne && decodeURIComponent(interne).includes(ancien)) correspond = true;
        } catch {
          /* src non analysable comme URL : on laisse la comparaison directe décider */
        }
      }
      if (correspond) {
        img.setAttribute('src', dataUrl);
        img.removeAttribute('srcset'); // sinon le srcset responsive l'emporte
      }
    }
  }
}

/** Tous les nœuds texte de la page, dans l'ordre du document. */
function noeudsTexte(): Text[] {
  const parcours = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const out: Text[] = [];
  for (let n = parcours.nextNode(); n; n = parcours.nextNode()) out.push(n as Text);
  return out;
}

/**
 * Aperçu live du texte. Pour chaque { ancien → nouveau }, on ne remplace QUE si
 * l'ancien texte correspond exactement à UN SEUL nœud texte de la page.
 *
 * Cette prudence est le cœur du procédé : à zéro correspondance il n'y a rien à
 * faire, et à plusieurs on ne sait pas laquelle l'utilisateur vient de modifier
 * — remplacer les deux afficherait un aperçu faux. Dans ces cas-là, c'est la
 * publication qui fait foi, ce qui est le bon repli.
 *
 * L'élément EN COURS DE FRAPPE est laissé tranquille : c'est déjà lui qui a
 * produit la valeur, la réécrire replacerait le curseur au début à chaque
 * lettre.
 */
function appliquerTextes(textes: Record<string, unknown>, enCours: Element | null): void {
  const paires = Object.entries(textes).filter(
    ([ancien, nouveau]) =>
      typeof ancien === 'string' && typeof nouveau === 'string' && ancien.trim().length >= LONGUEUR_ANCRE_MIN,
  ) as [string, string][];
  if (paires.length === 0) return;

  const noeuds = noeudsTexte();
  for (const [ancien, nouveau] of paires) {
    const cible = ancien.trim();
    const trouves = noeuds.filter((n) => (n.textContent || '').trim() === cible);
    if (trouves.length === 1 && trouves[0].parentElement !== enCours) {
      trouves[0].textContent = nouveau;
    }
  }
}

/**
 * L'élément qui porte exactement ce texte, s'il est unique dans la page.
 *
 * Renonce à zéro comme à plusieurs correspondances : agir sur le mauvais
 * élément est bien pire que de ne rien faire.
 */
function elementDuTexte(texte: string): HTMLElement | null {
  const cible = texte.trim();
  if (cible.length < LONGUEUR_ANCRE_MIN) return null;
  const trouves = noeudsTexte().filter((n) => (n.textContent || '').trim() === cible);
  if (trouves.length !== 1) return null;
  const parent = trouves[0].parentElement;
  return parent instanceof HTMLElement ? parent : null;
}

/**
 * Le texte manipulable sous le curseur : le premier élément, en remontant, dont
 * le contenu est UN SEUL nœud texte.
 *
 * C'est la même unité que celle utilisée pour l'aperçu du texte, et c'est aussi
 * celle qui correspond à un champ du `content.json` : un `<p>` fait d'un seul
 * texte est une valeur, un `<div>` qui en contient dix ne l'est pas.
 */
function texteDesignable(depart: Element | null): { element: HTMLElement; texte: string } | null {
  let n: Element | null = depart;
  for (let i = 0; i < 4 && n; i++) {
    if (n instanceof HTMLElement && n.childNodes.length === 1 && n.firstChild?.nodeType === Node.TEXT_NODE) {
      const t = (n.firstChild.textContent || '').trim();
      if (t.length >= LONGUEUR_ANCRE_MIN) return { element: n, texte: t };
    }
    n = n.parentElement;
  }
  return null;
}

/**
 * La structure des titres de la page, dans l'ordre du document.
 *
 * Elle se relève sur le DOM RENDU et non sur le content.json : c'est le gabarit
 * du site qui décide quel champ devient un titre principal et quel autre un
 * sous-titre, et deux sites bâtis sur le même JSON peuvent avoir des structures
 * différentes. Seul le DOM sait.
 */
function releverTitres(): { niveau: number; texte: string }[] {
  return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    .filter((el) => {
      // Un titre masqué (menu replié, panneau fermé) n'est pas lu par Google et
      // ne doit pas compter dans la structure. `offsetParent` est nul pour un
      // élément en `display: none`, ce qui est le cas qui compte ici.
      const html = el as HTMLElement;
      return html.offsetParent !== null || window.getComputedStyle(html).position === 'fixed';
    })
    .map((el) => ({
      niveau: Number(el.tagName.slice(1)),
      texte: (el.textContent || '').trim(),
    }));
}

// ─── Géométrie du glisser-déposer (portage de craft.js, MIT) ─────────
// Voir lib/editeur/glisser-liste.ts côté studio, qui porte les tests.

interface Boite { haut: number; gauche: number; largeur: number; hauteur: number; dansLeFlux: boolean }

function boiteDe(el: HTMLElement): Boite {
  const r = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return {
    haut: r.top + window.scrollY,
    gauche: r.left + window.scrollX,
    largeur: r.width,
    hauteur: r.height,
    // Un élément large qui occupe seul sa ligne est « dans le flux » : la
    // comparaison se fait alors verticalement. Une vignette de galerie côte à
    // côte ne l'est pas, et se compare horizontalement.
    dansLeFlux: style.display !== 'inline-block' && style.float === 'none' && r.width > window.innerWidth * 0.6,
  };
}

function positionDepot(boites: Boite[], x: number, y: number): { index: number; ou: 'avant' | 'apres' } {
  const resultat: { index: number; ou: 'avant' | 'apres' } = { index: 0, ou: 'avant' };
  let limiteGauche = 0, limiteX = 0, limiteY = 0;
  for (let i = 0; i < boites.length; i++) {
    const b = boites[i];
    const droite = b.gauche + b.largeur;
    const bas = b.haut + b.hauteur;
    const centreX = b.gauche + b.largeur / 2;
    const centreY = b.haut + b.hauteur / 2;
    if ((limiteX && b.gauche > limiteX) || (limiteY && centreY >= limiteY) || (limiteGauche && droite < limiteGauche)) continue;
    resultat.index = i;
    if (!b.dansLeFlux) {
      if (y < bas) limiteY = bas;
      if (x < centreX) { limiteX = centreX; resultat.ou = 'avant'; }
      else { limiteGauche = centreX; resultat.ou = 'apres'; }
    } else if (y < centreY) { resultat.ou = 'avant'; break; }
    else { resultat.ou = 'apres'; }
  }
  return resultat;
}

function indexDestination(depuis: number, position: { index: number; ou: 'avant' | 'apres' }, taille: number): number | null {
  if (depuis < 0 || depuis >= taille) return null;
  let cible = position.ou === 'avant' ? position.index : position.index + 1;
  if (cible > depuis) cible -= 1;
  cible = Math.max(0, Math.min(cible, taille - 1));
  return cible === depuis ? null : cible;
}

const CLASSE_SURVOL = 'scalenvia-survol';
const CLASSE_EDITABLE = 'scalenvia-editable';
const CLASSE_GLISSE = 'scalenvia-glisse';
const ID_TRAIT = 'scalenvia-trait-insertion';
const ID_BARRE = 'scalenvia-barre-element';
const CLASSE_CIBLE = 'scalenvia-element-vise';

const STYLE_OUTILS = `
.${CLASSE_SURVOL} { outline: 2px solid rgba(200, 158, 52, .9) !important; outline-offset: 2px; cursor: pointer !important; }
.${CLASSE_EDITABLE} { outline: 2px solid rgba(200, 158, 52, .9) !important; outline-offset: 2px; cursor: text !important; }
.${CLASSE_EDITABLE}:focus { outline-color: rgba(200, 158, 52, 1) !important; }
.${CLASSE_GLISSE} { opacity: .45 !important; }
.${CLASSE_CIBLE} { outline: 2px dashed rgba(200, 158, 52, .75) !important; outline-offset: 3px; }
#${ID_BARRE} {
  position: absolute; z-index: 2147483647; display: flex; gap: 2px; padding: 3px;
  background: #16181d; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.28);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
#${ID_BARRE} button {
  all: unset; box-sizing: border-box; cursor: pointer; color: #fff;
  font-size: 11px; line-height: 1; padding: 6px 9px; border-radius: 5px;
}
#${ID_BARRE} button:hover { background: rgba(255,255,255,.14); }
#${ID_BARRE} button:focus-visible { outline: 2px solid #c89e34; outline-offset: 1px; }
#${ID_BARRE} button[disabled] { opacity: .35; cursor: default; }
#${ID_TRAIT} {
  position: absolute; z-index: 2147483647; pointer-events: none;
  background: rgba(200, 158, 52, 1); border-radius: 2px;
}
`;

export function PreviewBridge() {
  useEffect(() => {
    // Uniquement en contexte embarqué (l'éditeur) — jamais pour un visiteur.
    if (typeof window === 'undefined' || window.parent === window) return;

    // Origine du parent, retenue au premier message accepté : on ne répond
    // jamais à la cantonade, seulement à l'éditeur qui nous a parlé.
    let origineParent: string | null = null;
    let outil: Outil = 'aucun';
    let listes: ListeDesignable[] = [];
    let survole: HTMLElement | null = null;
    let editable: HTMLElement | null = null;
    /** Le texte de l'élément au DÉBUT de la frappe : c'est lui qui l'identifie. */
    let texteOrigine = '';

    const style = document.createElement('style');
    style.textContent = STYLE_OUTILS;
    document.head.appendChild(style);

    const versEditeur = (message: Record<string, unknown>) => {
      if (!origineParent) return;
      try {
        window.parent.postMessage(message, origineParent);
      } catch {
        /* parent devenu inaccessible : l'aperçu reste consultable */
      }
    };

    const nettoyerSurvol = () => {
      survole?.classList.remove(CLASSE_SURVOL);
      survole = null;
    };

    /** Referme la session de frappe et rend l'élément non éditable. */
    const fermerEdition = () => {
      if (!editable) return;
      editable.removeAttribute('contenteditable');
      editable.classList.remove(CLASSE_EDITABLE);
      editable = null;
      texteOrigine = '';
    };

    // ─── Édition directe ──────────────────────────────────────────
    // `plaintext-only` (repris de Puck) : sans lui, un collage depuis Word
    // apporterait des balises et des styles dans un champ qui n'attend qu'une
    // chaîne. Et l'attribut n'est posé qu'AU CLIC, pas en permanence : un
    // document entièrement contentEditable perturbe le défilement et la
    // sélection sur mobile.
    const surSaisie = () => {
      if (!editable || !texteOrigine) return;
      versEditeur({ type: SITE_EDITE, origine: texteOrigine, valeur: editable.innerText.replace(/\n/g, ' ').trim() });
    };

    const ouvrirEdition = (element: HTMLElement, texte: string) => {
      if (editable === element) return;
      fermerEdition();
      editable = element;
      texteOrigine = texte;
      element.setAttribute('contenteditable', 'plaintext-only');
      element.classList.add(CLASSE_EDITABLE);
      element.focus();
    };

    const surSurvol = (e: MouseEvent) => {
      if (outil === 'aucun') { cacherBarre(); return; }
      // La barre suit l'élément de liste survolé — sauf pendant un glisser, où
      // elle se mettrait en travers du geste en cours.
      if (!glisse) {
        const cible = e.target as Element | null;
        if (!barre.contains(cible)) {
          const trouve = listeSous(cible);
          if (trouve) poserBarre(trouve);
          else if (vise && !vise.elements[vise.depuis].contains(cible)) cacherBarre();
        }
      }
      const trouve = texteDesignable(e.target as Element | null);
      if (trouve?.element === survole) return;
      nettoyerSurvol();
      // L'élément en cours de frappe porte déjà son propre liseré.
      if (trouve && trouve.element !== editable) {
        survole = trouve.element;
        survole.classList.add(CLASSE_SURVOL);
      }
    };

    // Le clic AGIT au lieu de naviguer : sans cela, cliquer un libellé de menu
    // quitterait la page qu'on est en train de modifier. Il n'est intercepté
    // que lorsqu'un texte est effectivement visé, et jamais en mode
    // « Parcourir » : sinon l'aperçu ne se parcourt plus.
    const surClic = (e: MouseEvent) => {
      if (outil === 'aucun') return;
      const trouve = texteDesignable(e.target as Element | null);
      if (!trouve) { fermerEdition(); return; }
      e.preventDefault();
      e.stopPropagation();
      if (outil === 'edition') {
        ouvrirEdition(trouve.element, trouve.texte);
      } else {
        versEditeur({ type: SITE_DESIGNE, texte: trouve.texte });
      }
    };

    // Entrée valide et referme : dans un champ qui tient sur une ligne, un
    // retour chariot n'a aucun sens et créerait un texte que le site ne sait
    // pas afficher. Échap referme sans rien de plus — la valeur est déjà partie
    // à chaque frappe.
    const surTouche = (e: KeyboardEvent) => {
      if (!editable) return;
      if (e.key === 'Enter') { e.preventDefault(); editable.blur(); fermerEdition(); }
      else if (e.key === 'Escape') { editable.blur(); fermerEdition(); }
    };

    // ─── Glisser-déposer d'une liste ──────────────────────────────
    let glisse: { liste: ListeDesignable; depuis: number; elements: HTMLElement[] } | null = null;

    /** Les éléments DOM d'une liste, dans l'ordre de ses ancres. `null` si une seule manque. */
    const elementsDeListe = (liste: ListeDesignable): HTMLElement[] | null => {
      const out: HTMLElement[] = [];
      for (const ancre of liste.ancres) {
        if (!ancre) return null;
        const el = elementDuTexte(ancre);
        if (!el) return null;
        // On remonte au bloc de l'élément (la carte de prestation), pas au
        // simple <h3> du titre : c'est le bloc qui se déplace visuellement.
        out.push((el.closest('li, article, figure') as HTMLElement | null) ?? el.parentElement ?? el);
      }
      // Deux ancres qui désignent le même bloc = ancrage raté : on renonce.
      return new Set(out).size === out.length ? out : null;
    };

    /**
     * Remet le DOM dans l'ordre des ancres reçues.
     *
     * L'éditeur envoie le contenu à chaque frappe, et le pont sait déjà
     * répercuter un texte ou une image. L'ORDRE, lui, ne se voyait pas : monter
     * une photo dans le formulaire ne bougeait rien à l'écran tant qu'on
     * n'avait pas publié, alors que c'est précisément le genre de geste qu'on
     * veut juger à l'oeil.
     *
     * Pas de nouveau message : `listes` arrive déjà à chaque envoi, dans
     * l'ordre du contenu. Il suffit de faire correspondre le DOM. Un même
     * mécanisme sert donc les boutons du formulaire, l'annulation, et tout ce
     * qui changera l'ordre demain.
     */
    const alignerLordreDesListes = () => {
      for (const liste of listes) {
        const voulu = elementsDeListe(liste);
        if (!voulu || voulu.length < 2) continue;
        const parent = voulu[0].parentElement;
        // Des éléments répartis sous plusieurs parents (une grille coupée en
        // colonnes) ne se réordonnent pas par simple insertion : on renonce.
        if (!parent || !voulu.every((el) => el.parentElement === parent)) continue;

        const actuel = Array.from(parent.children).filter((c) => voulu.includes(c as HTMLElement));
        if (actuel.every((el, i) => el === voulu[i])) continue;

        // Réinsère le groupe à la place qu'il occupait, dans le bon ordre. Le
        // repère est pris AVANT de déplacer quoi que ce soit, sinon il bouge
        // avec les éléments qu'on déplace.
        const repere = actuel[actuel.length - 1].nextSibling;
        for (const el of voulu) parent.insertBefore(el, repere);
      }
    };

    /** La liste et la position d'un élément survolé, s'il appartient à une liste. */
    const listeSous = (cible: Element | null): { liste: ListeDesignable; depuis: number; elements: HTMLElement[] } | null => {
      if (!cible) return null;
      for (const liste of listes) {
        const elements = elementsDeListe(liste);
        if (!elements) continue;
        const i = elements.findIndex((el) => el === cible || el.contains(cible));
        if (i >= 0) return { liste, depuis: i, elements };
      }
      return null;
    };

    const trait = document.createElement('div');
    trait.id = ID_TRAIT;

    // ─── Barre flottante sur l'élément visé ───────────────────────
    // Reprise de l'idée du « canvas toolbar » de GrapesJS : les gestes qui
    // portent sur un ÉLÉMENT se font sur l'élément, pas dans un formulaire où
    // il faut d'abord le retrouver. Trois actions, pas dix — au-delà, la barre
    // recouvre ce qu'elle commente.
    const barre = document.createElement('div');
    barre.id = ID_BARRE;
    barre.setAttribute('role', 'toolbar');
    barre.setAttribute('aria-label', 'Actions sur cet élément');
    let vise: { liste: ListeDesignable; depuis: number; elements: HTMLElement[] } | null = null;

    const bouton = (texte: string, titre: string, actif: boolean, faire: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texte;
      b.title = titre;
      if (!actif) b.disabled = true;
      else b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); faire(); });
      return b;
    };

    const cacherBarre = () => {
      vise?.elements[vise.depuis]?.classList.remove(CLASSE_CIBLE);
      vise = null;
      barre.remove();
    };

    const poserBarre = (trouve: { liste: ListeDesignable; depuis: number; elements: HTMLElement[] }) => {
      if (vise && vise.liste.chemin === trouve.liste.chemin && vise.depuis === trouve.depuis) return;
      cacherBarre();
      vise = trouve;

      const { liste, depuis, elements } = trouve;
      const el = elements[depuis];
      el.classList.add(CLASSE_CIBLE);

      barre.replaceChildren(
        bouton('↑', 'Remonter cet élément', depuis > 0,
          () => versEditeur({ type: SITE_DEPLACE, chemin: liste.chemin, de: depuis, vers: depuis - 1 })),
        bouton('↓', 'Descendre cet élément', depuis < elements.length - 1,
          () => versEditeur({ type: SITE_DEPLACE, chemin: liste.chemin, de: depuis, vers: depuis + 1 })),
        bouton('Dupliquer', 'Ajouter une copie juste après', true,
          () => versEditeur({ type: SITE_ACTION_LISTE, chemin: liste.chemin, index: depuis, action: 'dupliquer' })),
        // Une liste ne se vide jamais : la section disparaîtrait du site, et le
        // client ne ferait pas le lien avec le bouton qu'il vient de cliquer.
        bouton('Supprimer', elements.length > 1 ? 'Retirer cet élément' : 'Le dernier élément ne peut pas être retiré',
          elements.length > 1,
          () => versEditeur({ type: SITE_ACTION_LISTE, chemin: liste.chemin, index: depuis, action: 'supprimer' })),
      );

      const r = el.getBoundingClientRect();
      document.body.appendChild(barre);
      // Au-dessus par défaut ; à l'intérieur quand l'élément touche le haut de
      // la page, sinon la barre sortirait de l'écran et deviendrait inatteignable.
      const haut = r.top + window.scrollY;
      const dessus = haut - barre.offsetHeight - 6;
      barre.style.top = `${dessus > window.scrollY ? dessus : haut + 6}px`;
      barre.style.left = `${r.left + window.scrollX + 6}px`;
    };

    const effacerTrait = () => { trait.remove(); };

    const surGlisserDebut = (e: DragEvent) => {
      if (outil === 'aucun') return;
      cacherBarre();
      const trouve = listeSous(e.target as Element | null);
      if (!trouve) return;
      glisse = trouve;
      trouve.elements[trouve.depuis].classList.add(CLASSE_GLISSE);
      // Sans données, Firefox annule le glisser avant même de commencer.
      e.dataTransfer?.setData('text/plain', String(trouve.depuis));
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      document.body.appendChild(trait);
    };

    const surGlisserAuDessus = (e: DragEvent) => {
      if (!glisse) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      const boites = glisse.elements.map(boiteDe);
      const position = positionDepot(boites, e.pageX, e.pageY);
      const b = boites[position.index];
      if (!b) return;
      const epaisseur = 3;
      if (!b.dansLeFlux) {
        Object.assign(trait.style, {
          top: `${b.haut}px`,
          left: `${position.ou === 'avant' ? b.gauche : b.gauche + b.largeur}px`,
          width: `${epaisseur}px`,
          height: `${b.hauteur}px`,
        });
      } else {
        Object.assign(trait.style, {
          top: `${position.ou === 'avant' ? b.haut : b.haut + b.hauteur}px`,
          left: `${b.gauche}px`,
          width: `${b.largeur}px`,
          height: `${epaisseur}px`,
        });
      }
    };

    const surDepot = (e: DragEvent) => {
      if (!glisse) return;
      e.preventDefault();
      const { liste, depuis, elements } = glisse;
      const position = positionDepot(elements.map(boiteDe), e.pageX, e.pageY);
      const vers = indexDestination(depuis, position, elements.length);
      surGlisserFin();
      if (vers === null) return;
      versEditeur({ type: SITE_DEPLACE, chemin: liste.chemin, de: depuis, vers });
    };

    const surGlisserFin = () => {
      glisse?.elements[glisse.depuis].classList.remove(CLASSE_GLISSE);
      glisse = null;
      effacerTrait();
    };

    /** Rend saisissables les blocs des listes réordonnables (ou les libère). */
    const armerListes = () => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-scalenvia-glissable]'))) {
        el.removeAttribute('draggable');
        el.removeAttribute('data-scalenvia-glissable');
        el.style.cursor = '';
      }
      if (outil === 'aucun') return;
      for (const liste of listes) {
        const elements = elementsDeListe(liste);
        if (!elements) continue;
        for (const el of elements) {
          el.setAttribute('draggable', 'true');
          el.setAttribute('data-scalenvia-glissable', '');
          el.style.cursor = 'grab';
        }
      }
    };

    const surMessage = (event: MessageEvent) => {
      if (!origineAutorisee(event.origin)) return;
      const data = event.data as {
        type?: string;
        content?: { brand?: Record<string, unknown> };
        images?: Record<string, unknown>;
        texts?: Record<string, unknown>;
        outil?: unknown;
        listes?: unknown;
      } | null;
      if (!data || data.type !== VERS_SITE) return;
      origineParent = event.origin;

      const suivant: Outil =
        data.outil === 'designation' || data.outil === 'edition' ? data.outil : 'aucun';
      if (suivant !== outil) {
        outil = suivant;
        nettoyerSurvol();
        if (outil !== 'edition') fermerEdition();
      }
      listes = Array.isArray(data.listes)
        ? (data.listes as ListeDesignable[]).filter(
            (l) => l && typeof l.chemin === 'string' && Array.isArray(l.ancres) && l.ancres.length >= 2,
          )
        : [];

      const brand = data.content?.brand;
      if (brand && typeof brand === 'object') {
        const vars = brandVarsFrom(brand as Parameters<typeof brandVarsFrom>[0]);
        for (const [nom, valeur] of Object.entries(vars)) {
          document.documentElement.style.setProperty(nom, valeur);
        }
      }
      if (data.images && typeof data.images === 'object') appliquerImages(data.images);
      if (data.texts && typeof data.texts === 'object') appliquerTextes(data.texts, editable);
      // APRÈS les textes : les ancres décrivent le contenu du brouillon, donc
      // elles ne retrouvent leurs éléments qu'une fois le DOM à jour.
      alignerLordreDesListes();
      armerListes();
      // Après application, pas avant : le brouillon a pu changer un titre, et
      // contrôler la structure d'avant reviendrait à contrôler autre chose.
      versEditeur({ type: SITE_TITRES, titres: releverTitres() });
    };

    window.addEventListener('message', surMessage);
    document.addEventListener('mouseover', surSurvol, true);
    document.addEventListener('click', surClic, true);
    document.addEventListener('input', surSaisie, true);
    document.addEventListener('keydown', surTouche, true);
    document.addEventListener('dragstart', surGlisserDebut, true);
    document.addEventListener('dragover', surGlisserAuDessus, true);
    document.addEventListener('drop', surDepot, true);
    document.addEventListener('dragend', surGlisserFin, true);

    // Signale à l'éditeur qu'on est prêt : sans ce signal, un brouillon déjà en
    // cours au moment où l'iframe se charge n'arriverait qu'à la frappe suivante.
    try {
      window.parent.postMessage({ type: SITE_PRET }, '*');
    } catch {
      /* parent inaccessible : le pont reste inerte, le site s'affiche normalement */
    }

    return () => {
      window.removeEventListener('message', surMessage);
      document.removeEventListener('mouseover', surSurvol, true);
      document.removeEventListener('click', surClic, true);
      document.removeEventListener('input', surSaisie, true);
      document.removeEventListener('keydown', surTouche, true);
      document.removeEventListener('dragstart', surGlisserDebut, true);
      document.removeEventListener('dragover', surGlisserAuDessus, true);
      document.removeEventListener('drop', surDepot, true);
      document.removeEventListener('dragend', surGlisserFin, true);
      nettoyerSurvol();
      fermerEdition();
      cacherBarre();
      effacerTrait();
      outil = 'aucun';
      listes = [];
      armerListes();
      style.remove();
    };
  }, []);

  return null;
}
