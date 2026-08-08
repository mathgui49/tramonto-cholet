import type { ReactNode } from 'react';

// ════════════════════════════════════════════════════════════════
// Les ordinaux français des offres s'écrivent en exposant : « la 2ᵉ à −50 % ».
// Le HTML d'origine portait un <sup> écrit à la main ; le contenu étant
// désormais éditable, la règle est appliquée à la lecture, pour que le patron
// puisse taper « la 3e offerte » sans savoir ce qu'est une balise.
//
// Volontairement limitée aux listes d'offres, seul endroit où le site
// composait un exposant : une règle appliquée partout finirait par attraper
// un texte qui n'en demandait pas.
// ════════════════════════════════════════════════════════════════

// Un chiffre suivi d'une terminaison d'ordinal, et rien d'autre derrière.
const ORDINAL = /(\d)(ers|er|res|re|es|e)(?![\p{L}\p{N}])/u;

export function texteAvecOrdinaux(texte: string): ReactNode {
  const morceaux: ReactNode[] = [];
  let reste = texte;
  let cle = 0;

  for (;;) {
    const trouve = reste.match(ORDINAL);
    if (!trouve || trouve.index === undefined) break;
    morceaux.push(reste.slice(0, trouve.index + trouve[1].length));
    morceaux.push(<sup key={cle++}>{trouve[2]}</sup>);
    reste = reste.slice(trouve.index + trouve[0].length);
  }

  // Sans exposant, on rend la chaîne telle quelle : un nœud texte unique, que
  // l'éditeur Scalenvia sait désigner et modifier en place.
  if (morceaux.length === 0) return texte;

  morceaux.push(reste);
  return morceaux;
}
