/**
 * Contact channels shown on the "Contacto" pages (consumer and merchant).
 * Handles provided by the owner on 2026-09-22; TikTok changed to @discountmaps
 * on 2026-10-08. No WhatsApp line yet: add an entry with
 * `href: 'https://wa.me/57…'` when one exists.
 */
export const CONTACT_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/discountmaps',
    description: '@discountmaps',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@discountmaps',
    description: '@discountmaps',
  },
  {
    id: 'email',
    label: 'Correo',
    href: 'mailto:discountmaps1@gmail.com',
    description: 'discountmaps1@gmail.com',
  },
] as const;

export type ContactLinkId = (typeof CONTACT_LINKS)[number]['id'];

export interface ContactLink {
  id: ContactLinkId | (string & {});
  label: string;
  href: string;
  description: string;
}
