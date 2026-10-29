import { fireEvent, render } from '@testing-library/react';
import { LoginForm, SignupForm } from './auth-forms';

const noop = async () => ({});

describe('SignupForm', () => {
  it('asks for the password twice, hidden by default', () => {
    const { container } = render(
      <SignupForm action={noop} loginHref="/login" />,
    );
    const password = container.querySelector<HTMLInputElement>('#password');
    const confirm = container.querySelector<HTMLInputElement>('#confirm');
    expect(password?.type).toBe('password');
    expect(confirm?.type).toBe('password');
    expect(confirm?.name).toBe('confirm');
  });

  it('has a required terms checkbox linking to both legal pages', () => {
    const { container } = render(
      <SignupForm action={noop} loginHref="/login" />,
    );
    const box = container.querySelector<HTMLInputElement>('#acceptTerms');
    expect(box?.type).toBe('checkbox');
    expect(box?.required).toBe(true);
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('/terminos');
    expect(hrefs).toContain('/privacidad');
  });

  it('shows and hides both passwords with one button', () => {
    const { container, getByRole } = render(
      <SignupForm action={noop} loginHref="/login" />,
    );
    const toggle = getByRole('button', { name: 'Mostrar contraseña' });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector<HTMLInputElement>('#password')?.type).toBe(
      'text',
    );
    expect(container.querySelector<HTMLInputElement>('#confirm')?.type).toBe(
      'text',
    );
    fireEvent.click(getByRole('button', { name: 'Ocultar contraseña' }));
    expect(container.querySelector<HTMLInputElement>('#password')?.type).toBe(
      'password',
    );
  });
});

describe('LoginForm', () => {
  it('can reveal the password', () => {
    const { container, getByRole } = render(
      <LoginForm action={noop} registerHref="/registro" />,
    );
    const password = () =>
      container.querySelector<HTMLInputElement>('#password')?.type;
    expect(password()).toBe('password');
    fireEvent.click(getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password()).toBe('text');
  });
});
