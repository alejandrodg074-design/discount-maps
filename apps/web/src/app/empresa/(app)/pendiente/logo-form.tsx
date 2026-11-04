'use client';

import { useActionState } from 'react';
import {
  Button,
  FormError,
  FormNotice,
  ImageInputField,
  type AuthActionState,
  type AuthFormAction,
} from '@org/ui';

const initial: AuthActionState = {};

/** "Agregar / Cambiar logo" on the pending screen. */
export function PendingLogoForm({
  action,
  hasLogo,
}: {
  action: AuthFormAction;
  hasLogo: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form
      action={formAction}
      className="flex w-full flex-col gap-3 text-left"
      noValidate
    >
      <ImageInputField
        id="logo"
        name="logo"
        label={hasLogo ? 'Cambiar logo' : 'Agregar logo'}
        error={state.fieldErrors?.logo}
      />
      <FormNotice message={state.message} />
      <FormError message={state.error} />
      <Button type="submit" variant="secondary" block loading={pending}>
        Guardar logo
      </Button>
    </form>
  );
}
