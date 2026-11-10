/**
 * Who runs Discount Maps, as shown in the legal pages (`/terminos`,
 * `/terminos-empresas`, `/privacidad`), from the company's RUT (2026-11-10).
 * Ley 1480 de 2011 art. 50 and Decreto 1377 de 2013 art. 13 ask for name, ID,
 * address, email and phone; the owner chose not to publish a phone for now
 * (`phone: null` leaves it out of the text).
 */
export const LEGAL_ENTITY: {
  name: string;
  id: string;
  city: string;
  address: string;
  email: string;
  phone: string | null;
} = {
  name: 'DISCOUNT MAPS S.A.S.',
  id: 'NIT 902.124.873-8',
  city: 'Cali, Valle del Cauca, Colombia',
  address: 'Carrera 62 Bis # 9-71',
  email: 'discountmaps1@gmail.com',
  phone: null,
};

/**
 * Version of the terms and the privacy policy. Stored in the user metadata at
 * sign-up (`terms_version`, `terms_accepted_at`) as proof of the authorization
 * Ley 1581 requires. Bump it whenever either text changes materially.
 */
export const LEGAL_VERSION = '2026-11-10';

/** "10 de noviembre de 2026", the date printed on both pages. */
export const LEGAL_UPDATED_ON = '10 de noviembre de 2026';
