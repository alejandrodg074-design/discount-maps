/**
 * Business categories offered in the app, in display order (chips, selects).
 * Mirrors the enum `public.business_category`, which still holds the retired
 * values `beverages` and `desserts` (merged into `food` on 2026-10-29 and
 * blocked by the `businesses_category_current` check).
 */
export const CATEGORIES = [
  { id: 'food', label: 'Comida y bebidas' },
  { id: 'retail', label: 'Tiendas' },
  { id: 'beauty', label: 'Belleza' },
  { id: 'vehicles', label: 'Vehículos' },
  { id: 'nightlife', label: 'Bares y discotecas' },
  { id: 'pets', label: 'Mascotas' },
] as const;

export type BusinessCategory = (typeof CATEGORIES)[number]['id'];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [
  BusinessCategory,
  ...BusinessCategory[],
];

/** Retired enum values and the category that replaced them. */
const RETIRED_CATEGORIES: Record<string, BusinessCategory> = {
  restaurants: 'food',
  beverages: 'food',
  desserts: 'food',
};

/** Spanish label; accepts any stored value (the database enum also has retired ones). */
export function categoryLabel(id: string): string {
  const current = RETIRED_CATEGORIES[id] ?? id;
  return CATEGORIES.find((c) => c.id === current)?.label ?? id;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  pending: 'Pendiente de verificación',
  verified: 'Verificado',
  rejected: 'Rechazado',
};

/** Default map center when geolocation is unavailable: Cali (where the first businesses are). */
export const DEFAULT_MAP_CENTER = { lat: 3.4516, lng: -76.532 } as const;

/** City prefilled in the branch forms (the autocomplete overwrites it). */
export const DEFAULT_CITY = 'Cali';
/**
 * Search radius of the consumer map: 200 km, so a consumer anywhere in Valle del
 * Cauca sees every business in the department (Cali to Cartago is ~190 km).
 * Owner decision 2026-10-26; it was 10 km.
 */
export const DEFAULT_SEARCH_RADIUS_M = 200_000;
