# Tramonto · La Napolitaine de Cholet

Site vitrine 100 % statique pour la pizzeria **Tramonto**, Cholet.

- Single page responsive (mobile, tablette, desktop)
- HTML / CSS / JS vanilla — zéro build, zéro dépendance
- Prêt pour un déploiement direct sur **Vercel**

## Lancer en local

Ouvrez simplement `index.html` dans le navigateur, ou lancez un serveur statique :

```bash
npx serve .
```

## Déploiement Vercel

1. Pousser le dossier `site/` (ou la racine du repo) sur GitHub.
2. Importer le repo sur [vercel.com/new](https://vercel.com/new).
3. *Framework preset* : **Other**. Aucune commande de build n'est nécessaire.
4. Cliquer sur **Deploy** : c'est en ligne.

Le fichier `vercel.json` configure le cache des assets et quelques headers de sécurité.

## Structure

```
site/
├── index.html       # contenu et structure
├── styles.css       # design (mobile-first, sans framework)
├── script.js        # nav mobile, filtres menu, reveal au scroll
├── favicon.svg
├── vercel.json
└── README.md
```

## Personnaliser

- Couleurs et typographies : variables CSS au début de `styles.css` (`:root`).
- Plats / prix : section `<section class="menu">` dans `index.html`.
- Contact / horaires : section `<section class="visit">` et footer.
