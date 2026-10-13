import { PeopleBottomNav } from './bottom-nav';

/**
 * Tabbed shell: Mapas / Contacto / Cuenta. The spacer after the page reserves
 * the height of the fixed bar, so the last thing on a page (e.g. "Cerrar
 * sesión" on /cuenta) can always be scrolled above it. Do not rely on a
 * `pb-*` class on `PageShell`: its own safe-area padding overrides it.
 */
export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <div
        aria-hidden="true"
        className="h-[calc(5rem+env(safe-area-inset-bottom))] shrink-0"
      />
      <PeopleBottomNav />
    </>
  );
}
