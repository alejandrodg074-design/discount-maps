'use client';

import { useActionState } from 'react';
import {
  Button,
  FormError,
  type AuthActionState,
  type AuthFormAction,
} from '@org/ui';

const initial: AuthActionState = {};

export function AcceptTermsForm({
  action,
  next,
  termsHref,
  termsLabel,
}: {
  action: AuthFormAction;
  next: string;
  termsHref: string;
  termsLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const error = state.fieldErrors?.acceptTerms;
  const link = 'font-semibold text-brand-600 underline';
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          aria-invalid={error ? true : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600"
        />
        <span>
          Acepto los{' '}
          <a href={termsHref} target="_blank" rel="noreferrer" className={link}>
            {termsLabel}
          </a>{' '}
          y autorizo el tratamiento de mis datos según la{' '}
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            className={link}
          >
            Política de datos
          </a>
          .
        </span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <FormError message={state.error} />
      <Button type="submit" block loading={pending}>
        Aceptar y continuar
      </Button>
    </form>
  );
}
