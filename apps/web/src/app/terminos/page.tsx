import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CHARGE_RETRY_DAYS,
  MAX_CHARGE_ATTEMPTS,
  MIN_ACTIVE_COUPONS,
  TRIAL_DAYS,
  formatCop,
} from '@org/domain';
import {
  LegalList,
  LegalPage,
  LegalSection,
} from '../../components/legal-page';
import { subscriptionPricePesosOrNull } from '../../lib/billing';
import { LEGAL_ENTITY } from '../../lib/legal';

export const metadata: Metadata = { title: 'Términos y condiciones' };

/**
 * Terms of use (Ley 1480 de 2011, Ley 527 de 1999). Numbers come from
 * `@org/domain` and the price from SUBSCRIPTION_PRICE_COP, so the text follows
 * the product rules. Changing the substance: bump `LEGAL_VERSION`.
 */
export default function TermsPage() {
  const price = subscriptionPricePesosOrNull();
  const e = LEGAL_ENTITY;
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estos términos regulan el uso de Discount Maps (la «App»), disponible en
        discountmaps.app. Al crear una cuenta declaras que los leíste y los
        aceptas. Si no estás de acuerdo, no uses la App.
      </p>

      <LegalSection title="1. Quiénes somos">
        <p>
          La App es operada por {e.name}, identificado(a) con {e.id}, con
          domicilio en {e.city}, dirección {e.address}, correo{' '}
          <a href={`mailto:${e.email}`} className="text-brand-600 underline">
            {e.email}
          </a>{' '}
          y teléfono {e.phone} («Discount Maps», «nosotros»).
        </p>
      </LegalSection>

      <LegalSection title="2. Qué es Discount Maps">
        <p>
          Discount Maps es una plataforma que te muestra en un mapa los
          descuentos y beneficios («cupones») que ofrecen comercios aliados
          («Comercios»). Discount Maps no vende los productos ni presta los
          servicios de los Comercios: cada Comercio es el único responsable de
          lo que vende, de su calidad, precio, garantía e inventario, y de
          aplicar sus cupones en las condiciones publicadas.
        </p>
        <p>
          Discount Maps actúa como un portal de contacto entre personas y
          Comercios en los términos del artículo 53 de la Ley 1480 de 2011. Los
          Comercios se identifican ante nosotros con su razón social y NIT; si
          necesitas sus datos para presentar un reclamo, escríbenos y te los
          daremos.
        </p>
      </LegalSection>

      <LegalSection title="3. Cuentas">
        <LegalList>
          <li>
            Hay dos tipos de cuenta: <strong>Persona</strong>, para usar los
            cupones, y <strong>Empresa</strong>, para publicar cupones de un
            Comercio. Cada cuenta tiene un solo tipo.
          </li>
          <li>
            Debes ser mayor de 18 años y tener capacidad legal para contratar.
          </li>
          <li>
            Los datos que registres deben ser verdaderos y estar actualizados.
          </li>
          <li>
            Tu cuenta es personal e intransferible. Eres responsable de guardar
            tu contraseña y de lo que se haga con tu cuenta. Si crees que
            alguien más la usa, avísanos de inmediato.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Suscripción para personas">
        <LegalList>
          <li>
            Para usar los cupones necesitas una suscripción mensual
            {price ? (
              <>
                {' '}
                de <strong>{formatCop(price)}</strong>
              </>
            ) : null}
            . El precio vigente siempre se muestra en la App antes de registrar
            tu tarjeta y es el valor total que pagarás.
          </li>
          <li>
            <strong>Prueba gratis:</strong> los primeros {TRIAL_DAYS} días son
            gratis y no necesitas tarjeta para empezarlos. Cuando la prueba
            termina, para seguir usando los cupones debes registrar una tarjeta
            y en ese momento se hace el primer cobro mensual. Si registras la
            tarjeta antes, el primer cobro se hará el día en que termine la
            prueba, salvo que canceles antes.
          </li>
          <li>
            <strong>Renovación automática:</strong> la suscripción se renueva
            cada mes y se cobra a la tarjeta registrada hasta que la canceles.
          </li>
          <li>
            Los pagos se procesan a través de Wompi (Bancolombia). Discount Maps
            no recibe ni guarda el número completo de tu tarjeta; solo
            conservamos la franquicia y los últimos cuatro dígitos para que
            puedas reconocerla.
          </li>
          <li>
            <strong>Si un cobro falla</strong>, el acceso a los cupones se
            suspende de inmediato hasta que el pago se logre. Puedes registrar
            otra tarjeta en cualquier momento para pagar al instante; además lo
            reintentaremos cada {CHARGE_RETRY_DAYS} días hasta{' '}
            {MAX_CHARGE_ATTEMPTS} intentos. Si ninguno funciona, la suscripción
            se cancela y podrás reactivarla registrando una tarjeta.
          </li>
          <li>
            <strong>Cancelación:</strong> puedes cancelar cuando quieras desde
            «Cuenta» en la App, sin penalidad. No se harán más cobros y
            conservarás el acceso hasta el final del periodo ya pagado (o de la
            prueba). No hacemos reembolsos proporcionales por los días no usados
            de un periodo, salvo en los casos de la ley.
          </li>
          <li>
            <strong>Cambios de precio:</strong> te avisaremos con al menos 30
            días de anticipación por correo o en la App. El nuevo precio aplica
            desde el siguiente periodo; si no estás de acuerdo, puedes cancelar
            antes.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Derecho de retracto y reversión del pago">
        <p>
          Puedes retractarte de la suscripción dentro de los cinco (5) días
          hábiles siguientes al primer cobro, escribiendo a{' '}
          <a href={`mailto:${e.email}`} className="text-brand-600 underline">
            {e.email}
          </a>
          . Te devolveremos el valor pagado dentro de los treinta (30) días
          calendario siguientes y la suscripción quedará cancelada (artículo 47
          de la Ley 1480 de 2011).
        </p>
        <p>
          También puedes solicitar la reversión del pago en los casos del
          artículo 51 de la Ley 1480 de 2011 (fraude, operación no solicitada,
          servicio no prestado o que no corresponde a lo ofrecido), dentro de
          los cinco (5) días hábiles siguientes a que conozcas el hecho,
          presentando la queja ante nosotros y avisando al emisor de tu tarjeta.
        </p>
      </LegalSection>

      <LegalSection title="6. Cómo funcionan los cupones">
        <LegalList>
          <li>
            Cada cupón tiene las condiciones que fija el Comercio (descuento,
            vigencia, sedes, restricciones). Léelas antes de usarlo.
          </li>
          <li>
            Para usar un cupón muestras en el Comercio el código QR que genera
            la App. El código es personal, cambia cada minuto y vence a los
            pocos segundos: no sirven capturas de pantalla ni códigos de otras
            personas.
          </li>
          <li>
            Algunos cupones son de <strong>un solo uso por cliente</strong> (por
            ejemplo, un bono de primera compra). Una vez usado, no se puede
            volver a usar.
          </li>
          <li>
            El Comercio puede negarse a aplicar un cupón si no se cumplen sus
            condiciones o si detecta un uso irregular.
          </li>
          <li>
            Los Comercios pueden entrar o salir de la App y cambiar o retirar
            sus cupones. La suscripción da acceso a los cupones disponibles en
            cada momento; no garantiza un Comercio, cupón o ciudad en
            particular.
          </li>
          <li>
            Los cupones no son canjeables por dinero, no se pueden vender ni
            ceder y, salvo que el Comercio diga otra cosa, no son acumulables
            con otras promociones.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="7. Condiciones para Comercios">
        <LegalList>
          <li>
            El registro y la publicación de cupones no tienen costo por ahora.
            Si esto cambia, avisaremos con al menos 30 días de anticipación.
          </li>
          <li>
            El Comercio debe registrar datos verdaderos (razón social, NIT,
            nombre comercial, sedes) y quien lo registra declara tener
            facultades para representarlo. Discount Maps verifica cada Comercio
            antes de publicarlo y puede rechazarlo.
          </li>
          <li>
            Un Comercio aparece en el mapa solo cuando está verificado y tiene
            al menos {MIN_ACTIVE_COUPONS} cupones vigentes, y no puede bajar de
            ese mínimo mientras esté publicado.
          </li>
          <li>
            El Comercio se obliga a aplicar sus cupones vigentes a toda persona
            que presente un código QR válido, en las condiciones publicadas, y a
            cumplir las normas de protección al consumidor, publicidad e
            impuestos que le apliquen.
          </li>
          <li>
            El Comercio garantiza que tiene derecho a usar los logos, imágenes y
            textos que publica, y nos autoriza a mostrarlos en la App y en
            nuestras redes para promocionarlo, sin costo, mientras esté
            registrado.
          </li>
          <li>
            Con el código QR el Comercio conoce el nombre de la persona que usa
            el cupón. Solo puede usar ese dato para validar el cupón y debe
            tratarlo conforme a la Ley 1581 de 2012.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Usos prohibidos">
        <p>No está permitido:</p>
        <LegalList>
          <li>
            Compartir, vender o ceder tu cuenta, tus códigos QR o tus cupones.
          </li>
          <li>
            Usar la App para fines ilegales, fraudulentos o distintos a los
            previstos.
          </li>
          <li>
            Publicar información falsa, engañosa u ofensiva, o que infrinja
            derechos de terceros.
          </li>
          <li>
            Intentar acceder sin autorización a la App, a otras cuentas o a
            nuestros sistemas, o automatizar su uso.
          </li>
        </LegalList>
        <p>
          Si incumples estos términos podemos suspender o cerrar tu cuenta,
          informándote el motivo.
        </p>
      </LegalSection>

      <LegalSection title="9. Propiedad intelectual">
        <p>
          La marca Discount Maps, el diseño y el software de la App nos
          pertenecen o los usamos con autorización. Te damos permiso para usar
          la App de forma personal y no comercial (o, si eres Comercio, para
          administrar tus cupones), sin copiarla, modificarla ni explotarla de
          otra forma.
        </p>
      </LegalSection>

      <LegalSection title="10. Responsabilidad">
        <p>
          Hacemos nuestro mejor esfuerzo para que la App funcione de forma
          continua y segura, pero puede tener interrupciones por mantenimiento,
          fallas de proveedores o de internet. No respondemos por los productos
          y servicios de los Comercios ni por el incumplimiento de sus cupones,
          aunque te ayudaremos a reclamar. Nada de lo dispuesto aquí limita los
          derechos que te reconoce la Ley 1480 de 2011.
        </p>
      </LegalSection>

      <LegalSection title="11. Cierre de la cuenta">
        <p>
          Puedes pedir el cierre de tu cuenta y la eliminación de tus datos en
          cualquier momento escribiendo a {e.email}. Si tienes una suscripción
          activa, primero cancélala desde la App. Conservaremos solo la
          información que la ley nos obligue a guardar (por ejemplo, los
          registros contables de los pagos).
        </p>
      </LegalSection>

      <LegalSection title="12. Datos personales">
        <p>
          Tratamos tus datos según nuestra{' '}
          <Link href="/privacidad" className="text-brand-600 underline">
            Política de tratamiento de datos personales
          </Link>
          , que forma parte de estos términos.
        </p>
      </LegalSection>

      <LegalSection title="13. Cambios a estos términos">
        <p>
          Podemos actualizar estos términos. Si el cambio es importante te
          avisaremos por correo o en la App antes de que entre en vigencia. Si
          sigues usando la App después de esa fecha, entenderemos que aceptas
          los nuevos términos; si no, puedes cancelar tu suscripción y cerrar tu
          cuenta.
        </p>
      </LegalSection>

      <LegalSection title="14. Peticiones, quejas y reclamos">
        <p>
          Escríbenos a{' '}
          <a href={`mailto:${e.email}`} className="text-brand-600 underline">
            {e.email}
          </a>
          . Respondemos dentro de los quince (15) días hábiles siguientes. Si no
          quedas satisfecho, puedes acudir a la Superintendencia de Industria y
          Comercio (www.sic.gov.co).
        </p>
      </LegalSection>

      <LegalSection title="15. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia,
          incluidas la Ley 1480 de 2011 (Estatuto del Consumidor) y la Ley 527
          de 1999 (comercio electrónico). Las comunicaciones y aceptaciones
          electrónicas que hagas en la App tienen plena validez.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
