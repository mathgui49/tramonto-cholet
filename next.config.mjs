// ════════════════════════════════════════════════════════════════
// En-têtes portés depuis l'ancien vercel.json (le site était statique), plus
// la politique de contenu nécessaire au site : polices Google, plan Google
// Maps en iframe, et surtout `frame-ancestors`.
//
// Anti-clickjacking par CSP `frame-ancestors` UNIQUEMENT, pas de
// X-Frame-Options : DENY bloquerait aussi l'aperçu du studio Scalenvia, et
// X-Frame-Options ne sait pas autoriser une origine tierce.
// ════════════════════════════════════════════════════════════════
const enTetesSecurite = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'self' https://scalenvia.com https://*.scalenvia.com https://*.vercel.app",
      "connect-src 'self' https://scalenvia.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: enTetesSecurite },
      // Cache des médias, repris tel quel de l'ancien vercel.json.
      {
        source: '/:path*.:ext(svg|png|jpg|jpeg|webp|ico)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
