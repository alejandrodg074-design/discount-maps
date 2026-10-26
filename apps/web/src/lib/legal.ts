/**
 * Who runs Discount Maps, as shown in the legal pages (`/terminos`,
 * `/privacidad`). Ley 1480 de 2011 art. 50 and Decreto 1377 de 2013 art. 13
 * require the provider / data controller to be identified with name, ID,
 * address, email and phone.
 *
 * TODO(owner): fill in the real data before publishing. Until then the pages
 * show the bracketed placeholders.
 */
export const LEGAL_ENTITY = {
  /** Full name (persona natural) or razón social (SAS). */
  name: '[NOMBRE COMPLETO O RAZÓN SOCIAL]',
  /** "C.C. 123..." for a persona natural, "NIT 900..." for a company. */
  id: '[C.C. O NIT]',
  city: 'Cali, Valle del Cauca, Colombia',
  address: '[DIRECCIÓN]',
  email: 'discountmaps1@gmail.com',
  phone: '[TELÉFONO]',
} as const;

/**
 * Version of the terms and the privacy policy. Stored in the user metadata at
 * sign-up (`terms_version`, `terms_accepted_at`) as proof of the authorization
 * Ley 1581 requires. Bump it whenever either text changes materially.
 */
export const LEGAL_VERSION = '2026-10-26';

/** "26 de octubre de 2026", the date printed on both pages. */
export const LEGAL_UPDATED_ON = '26 de octubre de 2026';
