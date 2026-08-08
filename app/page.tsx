import { content } from '@/lib/content';
import { donneesStructureesJSON } from '@/lib/donnees-structurees';
import { Navigation } from '@/components/sections/navigation';
import { Hero } from '@/components/sections/hero';
import { APropos } from '@/components/sections/a-propos';
import { Carte } from '@/components/sections/carte';
import { Galerie, Visionneuse } from '@/components/sections/galerie';
import { Avis } from '@/components/sections/avis';
import { Offres } from '@/components/sections/offres';
import { Visite } from '@/components/sections/visite';
import { BarreMobile, PiedDePage } from '@/components/sections/pied-de-page';

// La page unique de la vitrine : l'ordre des sections est celui du site en
// production et ne dépend pas du contenu.

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: donneesStructureesJSON() }}
      />
      <a className="skip-link" href="#menu">
        {content.nav.lienEvitement}
      </a>
      <div className="tricolor" aria-hidden="true"></div>

      <Navigation />

      <main>
        <Hero />
        <APropos />
        <Carte />
        <Galerie />
        <Avis />
        <Offres />
        <Visite />
      </main>

      <PiedDePage />
      <BarreMobile />
      <Visionneuse />
    </>
  );
}
