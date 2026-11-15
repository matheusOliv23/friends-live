export const SITE_NAME = "Nexus Stream";

export const SITE_DESCRIPTION =
  "Transmita sua tela para amigos por um link privado, direto do navegador.";

export const SITE_TAGLINE = "Compartilhe sua tela com amigos, em tempo real.";

/** Base absoluta para OG/Twitter — defina NEXT_PUBLIC_SITE_URL em produção. */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return new URL(explicit);
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL("http://localhost:3000");
}
