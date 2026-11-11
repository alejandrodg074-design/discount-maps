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
    '/terminos',
    '/terminos-empresas',
    '/privacidad',
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
    '/terminos',
    '/terminos-empresas',
    '/privacidad',
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
    '/terminos',
    '/terminos-empresas',
    '/privacidad',
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

describe('gateRedirect, terms not accepted yet', () => {
  const pending = (role: UserRole) => ({
    signedIn: true,
    role,
    termsAccepted: false,
  });

  it.each([
    ['consumer', '/mapas', '/aceptar-terminos?next=%2Fmapas'],
    [
      'business',
      '/empresa/inicio',
      '/aceptar-terminos?next=%2Fempresa%2Finicio',
    ],
  ] as const)('sends a %s on %s to accept the terms', (role, path, target) => {
    expect(gateRedirect(path, pending(role))).toBe(target);
  });

  it('lets them read the terms and stay on the acceptance page', () => {
    expect(gateRedirect('/aceptar-terminos', pending('business'))).toBeNull();
    expect(gateRedirect('/terminos-empresas', pending('business'))).toBeNull();
    expect(gateRedirect('/terminos', pending('consumer'))).toBeNull();
  });

  it('never asks admins', () => {
    expect(gateRedirect('/admin', pending('admin'))).toBeNull();
  });

  it('sends users who already accepted away from the acceptance page', () => {
    expect(
      gateRedirect('/aceptar-terminos', {
        signedIn: true,
        role: 'consumer',
        termsAccepted: true,
      }),
    ).toBe('/mapas');
  });
});

describe('gateRedirect, password recovery', () => {
  it('lets signed-out users ask for the link, not signed-in ones', () => {
    expect(
      gateRedirect('/recuperar', { signedIn: false, role: null }),
    ).toBeNull();
    expect(
      gateRedirect('/recuperar', { signedIn: true, role: 'consumer' }),
    ).toBe('/mapas');
  });

  it.each(['consumer', 'business', 'admin'] as const)(
    'opens /nueva-contrasena to a signed-in %s, even before the terms',
    (role) => {
      expect(
        gateRedirect('/nueva-contrasena', {
          signedIn: true,
          role,
          termsAccepted: false,
        }),
      ).toBeNull();
    },
  );

  it('keeps /nueva-contrasena as the next step after the recovery link', () => {
    expect(safeNextForRole('/nueva-contrasena', 'business')).toBe(
      '/nueva-contrasena',
    );
  });

  it('needs a session for /nueva-contrasena', () => {
    expect(
      gateRedirect('/nueva-contrasena', { signedIn: false, role: null }),
    ).toBe('/login?next=%2Fnueva-contrasena');
  });
});
