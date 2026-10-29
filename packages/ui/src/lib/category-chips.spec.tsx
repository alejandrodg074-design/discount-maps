import { fireEvent, render, screen } from '@testing-library/react';
import { CategoryChips } from './category-chips';

describe('CategoryChips', () => {
  it('renders "Todas" plus the five categories with the selection pressed', () => {
    render(<CategoryChips value="pets" onChange={() => undefined} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(6);
    expect(
      screen
        .getByRole('button', { name: 'Mascotas' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen
        .getByRole('button', { name: 'Todas' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('emits the category id, and null for "Todas"', () => {
    const onChange = jest.fn();
    render(<CategoryChips value={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Bares y discotecas' }));
    expect(onChange).toHaveBeenCalledWith('nightlife');
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
