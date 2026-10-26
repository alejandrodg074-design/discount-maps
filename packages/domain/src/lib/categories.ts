export const CATEGORIES = [
  { id: 'restaurants', label: 'Restaurantes' },
  { id: 'beverages', label: 'Bebidas' },
  { id: 'desserts', label: 'Postres' },
  { id: 'retail', label: 'Tiendas' },
] as const;

export type BusinessCategory = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [
  BusinessCategory,
  ...BusinessCategory[],
];

export function categoryLabel(id: BusinessCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  pending: 'Pendiente de verificación',
  verified: 'Verificado',
  rejected: 'Rechazado',
};

/** Default map center when geolocation is unavailable: Bogotá. */
export const DEFAULT_MAP_CENTER = { lat: 4.711, lng: -74.0721 } as const;
/**
 * Search radius of the consumer map: 200 km, so a consumer anywhere in Valle del
 * Cauca sees every business in the department (Cali to Cartago is ~190 km).
 * Owner decision 2026-10-26; it was 10 km.
 */
export const DEFAULT_SEARCH_RADIUS_M = 200_000;
