import type { UserRole } from '@org/supabase';
import { gateRedirect, homeForRole, safeNextForRole } from './routing';

const signedIn = (role: UserRole | null) => ({ signedIn: true, role });
const signedOut = { signedIn: false, role: null };

describe('homeForRole', () => {
  it.each([
    ['consumer', '/mapas'],
    ['business', '/empresa/inicio'],
    ['admin', '/admin'],
    [null, '/mapas'],
  ] as const)('%s → %s', (role, home) => {
    expect(homeForRole(role)).toBe(home);
  });
});

describe('gateRedirect, signed out', () => {
  it.each([
    '/',
    '/login',
    '/registro',
    '/empresa',
    '/empresa/registro',
    '/sin-conexion',
  ])('lets %s through', (path) => {
    expect(gateRedirect(path, signedOut)).toBeNull();
  });

  it.each([
    ['/mapas', '/login?next=%2Fmapas'],
    ['/empresa/inicio', '/login?next=%2Fempresa%2Finicio'],
    ['/empresa/cupones/nuevo', '/login?next=%2Fempresa%2Fcupones%2Fnuevo'],
    ['/admin', '/login?next=%2Fadmin'],
  ])('sends %s to login', (path, target) => {
    expect(gateRedirect(path, signedOut)).toBe(target);
  });
});

describe('gateRedirect, consumer', () => {
  const consumer = signedIn('consumer');

  it.each([
    '/mapas',
    '/cuenta',
    '/negocios/x',
    '/suscripcion/tarjeta',
    '/sin-conexion',
  ])('lets %s through', (path) => {
    expect(gateRedirect(path, consumer)).toBeNull();
  });

  it.each([
    '/empresa',
    '/empresa/inicio',
    '/empresa/cupones',
    '/admin',
    '/',
    '/login',
  ])('sends %s to /mapas', (path) => {
    expect(gateRedirect(path, consumer)).toBe('/mapas');
  });

  it('does not treat look-alike paths as business paths', () => {
    expect(gateRedirect('/empresas-cerca', consumer)).toBeNull();
  });
});

describe('gateRedirect, business', () => {
  const business = signedIn('business');

  it.each([
    '/empresa/inicio',
    '/empresa/onboarding',
    '/empresa/pendiente',
    '/empresa/cupones/123',
    '/empresa/verificar',
    '/sin-conexion',
  ])('lets %s through', (path) => {
    expect(gateRedirect(path, business)).toBeNull();
  });

  it.each([
    '/',
    '/login',
    '/empresa',
    '/empresa/registro',
    '/mapas',
    '/cuenta',
    '/inicio',
    '/suscripcion/tarjeta',
    '/admin',
  ])('sends %s to /empresa/inicio', (path) => {
    expect(gateRedirect(path, business)).toBe('/empresa/inicio');
  });
});

describe('gateRedirect, admin', () => {
  const admin = signedIn('admin');

  it.each(['/admin', '/mapas', '/empresa/inicio'])(
    'lets %s through',
    (path) => {
      expect(gateRedirect(path, admin)).toBeNull();
    },
  );

  it('sends the landing to /admin', () => {
    expect(gateRedirect('/', admin)).toBe('/admin');
  });
});

describe('safeNextForRole', () => {
  it('keeps a next path inside the role area', () => {
    expect(safeNextForRole('/empresa/cupones', 'business')).toBe(
      '/empresa/cupones',
    );
    expect(safeNextForRole('/negocios/1?x=1', 'consumer')).toBe(
      '/negocios/1?x=1',
    );
  });

  it('falls back to the home when next is outside the role area', () => {
    expect(safeNextForRole('/mapas', 'business')).toBe('/empresa/inicio');
    expect(safeNextForRole('/empresa/inicio', 'consumer')).toBe('/mapas');
  });

  it.each([
    null,
    '',
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    '/\t/evil.test',
    '/\n/evil.test',
    '/\r/evil.test',
  ])('rejects %p', (value) => {
    expect(safeNextForRole(value, 'consumer')).toBe('/mapas');
  });
});
