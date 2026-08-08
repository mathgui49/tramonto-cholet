import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import './globals.css';
import { brandVars, content } from '@/lib/content';
import { PreviewBridge } from '@/components/PreviewBridge';
import { Comportements } from '@/components/comportements';

// ════════════════════════════════════════════════════════════════
// Enveloppe du site. Elle reprend, une par une, les balises de l'ancien
// index.html statique : référencement, Open Graph, icônes, manifeste, la
// préconnexion aux polices Google (conservée telle quelle pour que le rendu
// typographique soit strictement le même qu'en production) et le petit script
// qui applique le thème sombre AVANT le premier affichage.
//
// Les couleurs de marque sont posées en style inline sur <html> : cela
// l'emporte sur la règle `:root` de globals.css quel que soit l'ordre
// d'injection des feuilles de style.
// ════════════════════════════════════════════════════════════════

const { seo, business } = content;

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: business.name }],
  manifest: '/site.webmanifest',
  alternates: { canonical: `${seo.url}/` },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.twitterTitle,
    description: seo.twitterDescription,
    images: [{ url: `${seo.url}${seo.ogImage}`, alt: seo.twitterImageAlt }],
  },
  other: {
    'geo.region': 'FR-PDL',
    'geo.placename': business.ville,
    'geo.position': `${business.latitude};${business.longitude}`,
    ICBM: `${business.latitude}, ${business.longitude}`,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: seo.themeColorClair,
};

// Applique le thème mémorisé avant le premier rendu, pour éviter le flash de
// clair au chargement d'un visiteur qui avait choisi le sombre.
const SCRIPT_THEME = `try{var t=localStorage.getItem("tramonto-theme");if(t==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-FR" style={brandVars() as CSSProperties}>
      <head>
        {/* Open Graph : émis à la main car `restaurant.restaurant` ne fait pas
            partie des types que l'API metadata de Next sait produire. */}
        <meta property="og:title" content={seo.ogTitle} />
        <meta property="og:description" content={seo.ogDescription} />
        <meta property="og:type" content="restaurant.restaurant" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content={business.nomComplet} />
        <meta property="og:url" content={`${seo.url}/`} />
        <meta property="og:image" content={`${seo.url}${seo.ogImage}`} />
        <meta property="og:image:secure_url" content={`${seo.url}${seo.ogImage}`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={seo.ogImageAlt} />

        <link rel="preload" as="image" href={content.hero.image.webp} type="image/webp" fetchPriority="high" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
        {children}
        <Comportements />
        <PreviewBridge />
      </body>
    </html>
  );
}
