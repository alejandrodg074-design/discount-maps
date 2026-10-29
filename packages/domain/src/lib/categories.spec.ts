import { CATEGORIES, CATEGORY_IDS, categoryLabel } from './categories';

describe('categories', () => {
  it('offers the five current categories in display order', () => {
    expect(CATEGORY_IDS).toEqual([
      'food',
      'retail',
      'vehicles',
      'nightlife',
      'pets',
    ]);
    expect(CATEGORIES[0].label).toBe('Comida y bebidas');
  });

  it('labels current and retired values', () => {
    expect(categoryLabel('vehicles')).toBe('Vehículos');
    expect(categoryLabel('nightlife')).toBe('Bares y discotecas');
    expect(categoryLabel('desserts')).toBe('Comida y bebidas');
    expect(categoryLabel('restaurants')).toBe('Comida y bebidas');
  });
});
