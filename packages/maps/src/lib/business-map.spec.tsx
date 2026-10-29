import { fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BusinessMap, viewportPoints } from './business-map';

jest.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Map: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  AdvancedMarker: ({
    title,
    onClick,
    children,
  }: {
    title: string;
    onClick: () => void;
    children: ReactNode;
  }) => (
    <button type="button" data-marker={title} onClick={onClick}>
      {children}
    </button>
  ),
  Marker: ({ title, onClick }: { title: string; onClick: () => void }) => (
    <button type="button" data-marker={title} onClick={onClick} />
  ),
  Pin: () => <span data-pin />,
  InfoWindow: ({ children }: { children: ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  useMap: () => null,
}));

const center = { lat: 4.711, lng: -74.0721 };
const markers = [
  { id: 'a', lat: 4.65, lng: -74.06, label: 'Sede Chapinero', href: '/x' },
  { id: 'b', lat: 4.7, lng: -74.03, label: 'Sede Usaquén' },
];

describe('BusinessMap', () => {
  it('renders the placeholder without an API key', () => {
    const { container } = render(
      <BusinessMap center={center} markers={markers} apiKey={null} />,
    );
    const box = container.querySelector('[role="img"]');
    expect(box?.getAttribute('aria-label')).toBe('Mapa no disponible');
    expect(box?.textContent).toContain('2 sedes');
  });

  it('renders one branded pin per marker with a map id', () => {
    const { container } = render(
      <BusinessMap center={center} markers={markers} apiKey="k" mapId="m" />,
    );
    expect(container.querySelectorAll('[data-marker]').length).toBe(2);
    expect(container.querySelectorAll('[data-pin]').length).toBe(2);
  });

  it('falls back to classic markers without a map id and opens the info window', () => {
    const { container } = render(
      <BusinessMap center={center} markers={markers} apiKey="k" />,
    );
    expect(container.querySelectorAll('[data-pin]').length).toBe(0);
    fireEvent.click(container.querySelector('[data-marker="Sede Chapinero"]')!);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('Sede Chapinero');
    expect(dialog?.querySelector('a')?.getAttribute('href')).toBe('/x');
  });
});

describe('BusinessMap user location', () => {
  const me = { lat: 4.68, lng: -74.05 };

  it('draws the viewer as a blue dot and offers "Mi ubicación"', () => {
    const { container, getByRole } = render(
      <BusinessMap
        center={me}
        markers={markers}
        apiKey="k"
        mapId="m"
        userLocation={me}
      />,
    );
    expect(container.querySelectorAll('[data-user-dot]').length).toBe(1);
    expect(
      getByRole('button', { name: 'Centrar en mi ubicación' }),
    ).toBeTruthy();
  });

  it('asks for the position when it is not known yet', () => {
    const onLocate = jest.fn();
    const { container, getByRole } = render(
      <BusinessMap
        center={center}
        markers={markers}
        apiKey="k"
        mapId="m"
        onLocate={onLocate}
      />,
    );
    expect(container.querySelectorAll('[data-user-dot]').length).toBe(0);
    fireEvent.click(getByRole('button', { name: 'Centrar en mi ubicación' }));
    expect(onLocate).toHaveBeenCalledTimes(1);
  });

  it('has no locate button without a position or a way to get one', () => {
    const { queryByRole } = render(
      <BusinessMap center={center} markers={markers} apiKey="k" />,
    );
    expect(
      queryByRole('button', { name: 'Centrar en mi ubicación' }),
    ).toBeNull();
  });
});

describe('viewportPoints', () => {
  const far = { lat: 4.6, lng: -75.6 };
  const near1 = { lat: 3.45, lng: -76.53 };
  const near2 = { lat: 3.46, lng: -76.52 };
  const mid = { lat: 3.9, lng: -76.3 };
  const me = { lat: 3.451, lng: -76.531 };

  it('keeps every marker when the viewer is unknown', () => {
    expect(viewportPoints([far, near1], null)).toEqual([far, near1]);
  });

  it('keeps the viewer and only the closest markers', () => {
    expect(viewportPoints([far, mid, near2, near1], me, 2)).toEqual([
      me,
      near1,
      near2,
    ]);
  });

  it('is just the viewer when there are no markers', () => {
    expect(viewportPoints([], me)).toEqual([me]);
  });
});
