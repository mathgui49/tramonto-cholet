import type { Metadata } from 'next';
import { content } from '@/lib/content';

// Page 404, portée depuis l'ancien 404.html. Ses styles sont à la fin de
// app/globals.css, sous le titre « Page 404 ».

export const metadata: Metadata = {
  title: content.pageIntrouvable.title,
  robots: { index: false, follow: false },
};

export default function PageIntrouvable() {
  const page = content.pageIntrouvable;

  return (
    <>
      <div className="tricolor" aria-hidden="true"></div>
      <main className="nf">
        <div className="nf__inner">
          <div className="nf__sun" aria-hidden="true"></div>
          <p className="nf__code">{page.code}</p>
          <h1>{page.titre}</h1>
          <p>{page.texte}</p>
          <div className="nf__actions">
            <a className="btn btn--primary btn--lg" href={page.ctaAccueil.href}>
              {page.ctaAccueil.label}
            </a>
            <a className="btn btn--ghost btn--lg" href={page.ctaCarte.href}>
              {page.ctaCarte.label}
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
