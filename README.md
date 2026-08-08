# Tramonto · La Napolitaine de Cholet

Site vitrine de la pizzeria **Tramonto**, 172 rue Nationale à Cholet.

- Next.js 15 (App Router), TypeScript strict, une seule page
- Contenu entièrement éditable depuis l'éditeur du studio Scalenvia
- Déploiement Vercel, preset **Next.js**

> Le site était auparavant un trio `index.html` / `styles.css` / `script.js`
> servi tel quel. Il a été porté sur Next.js **sans changer son rendu** : la
> feuille de style historique a été reprise à l'identique dans
> `app/globals.css`, et les comportements de `script.js` dans
> `components/comportements.tsx`.

## Lancer en local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Modifier le contenu

**`content.json` à la racine est la seule source de contenu.** Textes, titres,
chemins de photos avec leur `alt`, libellés de navigation, carte et tarifs,
horaires, coordonnées, offres, avis, métadonnées de référencement et couleur
de marque : tout y est. Rien d'éditable n'est écrit en dur dans le JSX.

- `lib/content.ts` type ce fichier (`SiteContent`) et calcule les variables CSS
  de marque à partir de `brand.primary` (`--c-accent` et ses deux dérivées).
- `components/PreviewBridge.tsx` est le pont avec l'éditeur du studio : il ne
  s'active que si la page est affichée dans une `<iframe>` du portail, jamais
  pour un visiteur. **Ce fichier est un contrat partagé, il ne se modifie pas.**
- `lib/donnees-structurees.ts` reconstruit les données schema.org depuis
  `content.json` : un tarif corrigé dans l'éditeur est aussi corrigé pour
  Google.

## Structure

```
app/
  layout.tsx        # métadonnées, polices, thème avant peinture, ponts
  page.tsx          # composition des sections + données structurées
  not-found.tsx     # page 404
  globals.css       # feuille de style historique, portée telle quelle
components/
  sections/         # une section par fichier
  comportements.tsx # thème, menu mobile, filtres, révélations, visionneuse
  icones.tsx        # pictogrammes en ligne
  typographie.tsx   # ordinaux en exposant des offres
  PreviewBridge.tsx # aperçu live de l'éditeur (copie conforme)
lib/
  content.ts        # contenu typé + couleurs de marque
  donnees-structurees.ts
content.json        # LE fichier que le client édite
public/             # photos, icônes, og.jpg, robots.txt, sitemap.xml
```

`robots.txt` et `sitemap.xml` sont servis depuis `public/`, avec exactement le
contenu qu'ils avaient sur la version statique.

## Sécurité

Les en-têtes vivent dans `next.config.mjs` (ils venaient de l'ancien
`vercel.json`) : `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `Strict-Transport-Security` et une politique de contenu
complète.

Le clickjacking est bloqué par `frame-ancestors` **uniquement**, sans
`X-Frame-Options` : `DENY` empêcherait aussi l'aperçu du studio Scalenvia, et
`X-Frame-Options` ne sait pas autoriser une origine tierce. Le site n'est donc
encadrable que par lui-même et par Scalenvia.

Aucun secret dans le dépôt, aucune variable d'environnement nécessaire.

## Tenue du texte long

Le propriétaire modifie ses textes : la mise en page est conçue pour encaisser
des libellés bien plus longs qu'aujourd'hui sans rien couper ni déborder
(pistes de grille rétractables, enfants de flex à `min-width: 0`, hauteurs
minimales plutôt que figées, coupure des mots trop longs). Vérifié à 320, 390,
768 et 1280 px avec des textes triplés.

## Anomalie connue (héritée de la version en production)

En dessous de **980 px**, la photo de façade de la section « La maison » ne
s'affiche pas : `.about__media` est un élément de grille à marges automatiques,
sa largeur est donc celle de son contenu — et tout son contenu est en position
absolue. Le bloc se réduit à 0 × 0 et la photo disparaît. C'est le comportement
du site en ligne aujourd'hui ; le portage devait rester au pixel près, il n'a
donc **pas** été corrigé.

Correction, si le propriétaire la souhaite : ajouter `width: 100%` à
`.about__media` dans le bloc `@media (max-width: 980px)` de `app/globals.css`,
et retirer juste en dessous la règle `.about__card` qui la remet en position
absolue. La photo réapparaît alors sur mobile et tablette, ce qui rallonge la
page d'environ 420 px sur un écran de 390 px.
