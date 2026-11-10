import type { Metadata } from 'next';
import Link from 'next/link';
import { MIN_ACTIVE_COUPONS } from '@org/domain';
import {
  LegalList,
  LegalPage,
  LegalSection,
} from '../../components/legal-page';
import { LEGAL_ENTITY } from '../../lib/legal';

export const metadata: Metadata = {
  title: 'Términos y condiciones para empresas',
};

/**
 * Terms for businesses that publish coupons, accepted at /empresa/registro.
 * Includes the authorization to use the business' name, brand and content in
 * Discount Maps' marketing and social media (owner, 2026-11-10). Changing the
 * substance: bump `LEGAL_VERSION`.
 */
export default function BusinessTermsPage() {
  const e = LEGAL_ENTITY;
  const mail = (
    <a href={`mailto:${e.email}`} className="text-brand-600 underline">
      {e.email}
    </a>
  );
  return (
    <LegalPage title="Términos y condiciones para empresas">
      <p>
        Estos términos regulan la relación entre Discount Maps y los negocios
        que publican cupones en la App («Comercio», «tú»). Quien crea la cuenta
        de empresa declara que tiene facultades para representar al Comercio y
        que lo obliga al aceptarlos. Las personas que usan los cupones tienen
        sus propios{' '}
        <Link href="/terminos" className="text-brand-600 underline">
          Términos para personas
        </Link>
        .
      </p>

      <LegalSection title="1. Quiénes somos">
        <p>
          La App es operada por {e.name}, identificada con {e.id}, con domicilio
          en {e.city}
          {e.address ? `, dirección ${e.address}` : ''}, correo {mail}
          {e.phone ? ` y teléfono ${e.phone}` : ''} («Discount Maps»,
          «nosotros»).
        </p>
      </LegalSection>

      <LegalSection title="2. Qué ofrece Discount Maps al Comercio">
        <LegalList>
          <li>
            Publicar el Comercio, sus sedes y sus cupones en el mapa de la App,
            donde los ven las personas suscritas.
          </li>
          <li>
            Validar cada cupón con un código QR desde la cuenta de empresa.
          </li>
          <li>
            Promocionar al Comercio en las redes sociales y canales de Discount
            Maps, según la sección 6.
          </li>
        </LegalList>
        <p>
          Discount Maps actúa como portal de contacto entre el Comercio y las
          personas (artículo 53 de la Ley 1480 de 2011). No vende los productos
          ni presta los servicios del Comercio.
        </p>
      </LegalSection>

      <LegalSection title="3. Registro y verificación">
        <LegalList>
          <li>
            El Comercio registra datos verdaderos y actualizados: razón social,
            NIT, nombre comercial, categoría y sedes con su dirección.
          </li>
          <li>
            Discount Maps verifica cada Comercio antes de publicarlo y puede
            pedir documentos (por ejemplo, el certificado de Cámara de Comercio
            o el RUT) o rechazar la solicitud.
          </li>
          <li>
            Si una persona necesita los datos del Comercio para presentar un
            reclamo, Discount Maps se los puede entregar, como exige la Ley 1480
            de 2011.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Costo">
        <p>
          Registrarse y publicar cupones no tiene costo por ahora. Si en el
          futuro se cobra por algún servicio, lo avisaremos con al menos 30 días
          de anticipación y podrás retirarte antes sin pagar nada.
        </p>
      </LegalSection>

      <LegalSection title="5. Cupones">
        <LegalList>
          <li>
            Para aparecer en el mapa el Comercio debe tener al menos{' '}
            {MIN_ACTIVE_COUPONS} cupones vigentes, y no puede bajar de ese
            mínimo mientras esté publicado.
          </li>
          <li>
            Cada cupón describe con claridad el beneficio, su vigencia, las
            sedes donde aplica y sus restricciones. Lo publicado debe ser cierto
            (artículos 29 y 30 de la Ley 1480 de 2011): no se permite subir un
            precio para simular un descuento.
          </li>
          <li>
            El Comercio aplica el cupón a toda persona que presente un código QR
            válido, en las condiciones publicadas. Si el cupón es de un solo uso
            por cliente, la App lo controla.
          </li>
          <li>
            El Comercio es el único responsable de sus productos y servicios, su
            calidad, precio, garantía, inventario e impuestos.
          </li>
          <li>
            El Comercio puede editar, pausar o borrar sus cupones en cualquier
            momento, dentro de la regla del mínimo de cupones vigentes. Los
            cambios no afectan los QR que una persona ya mostró en caja.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="6. Autorización de uso de marca y contenido para marketing">
        <p>
          Al aceptar estos términos, el Comercio autoriza a Discount Maps, de
          forma gratuita y no exclusiva, mientras sea aliado, a:
        </p>
        <LegalList>
          <li>
            Usar su nombre comercial, razón social, marcas, logos, fotos,
            descripciones, cupones y datos de sus sedes en la App y en piezas de
            marketing de Discount Maps.
          </li>
          <li>
            Publicar ese contenido en redes sociales (Instagram, TikTok,
            Facebook, WhatsApp y las que se usen en el futuro), en la página
            web, en correos y en material impreso, incluidas publicaciones en
            colaboración con las cuentas del Comercio.
          </li>
          <li>
            Tomar fotos y grabar videos en las sedes del Comercio, en fechas y
            horarios acordados con él, para crear ese contenido.
          </li>
          <li>
            Adaptar el contenido al formato de cada red (recortes, textos,
            música, subtítulos), sin cambiar el sentido ni presentar información
            falsa sobre el Comercio.
          </li>
        </LegalList>
        <p>Además:</p>
        <LegalList>
          <li>
            El Comercio sigue siendo el dueño de sus marcas y logos; esta
            autorización no le transfiere ningún derecho de propiedad a Discount
            Maps.
          </li>
          <li>
            El Comercio garantiza que tiene derecho a usar las marcas, imágenes
            y textos que entrega o publica, y que las personas que aparezcan en
            fotos o videos de su negocio (por ejemplo, sus empleados) lo
            autorizaron. Discount Maps no grabará a clientes del Comercio sin su
            autorización.
          </li>
          <li>
            El Comercio puede pedir por escrito que no se publique o que se
            retire un contenido específico, y lo atenderemos dentro de los diez
            (10) días hábiles siguientes.
          </li>
          <li>
            Si el Comercio deja de ser aliado, no publicaremos contenido nuevo
            sobre él. Lo ya publicado puede seguir en nuestras redes, salvo que
            pida retirarlo como se indica arriba.
          </li>
          <li>
            Mientras sea aliado, el Comercio puede usar la marca Discount Maps y
            los materiales que le entreguemos (por ejemplo, el aviso con el QR
            para la caja) para anunciar que tiene descuentos en la App.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="7. Datos de las personas que usan cupones">
        <p>
          Al validar un QR, el Comercio ve el nombre de la persona. Solo puede
          usar ese dato para validar el cupón y debe tratarlo según la Ley 1581
          de 2012; no puede usarlo para enviarle publicidad ni compartirlo con
          terceros sin su autorización.
        </p>
      </LegalSection>

      <LegalSection title="8. Usos prohibidos">
        <LegalList>
          <li>Publicar cupones falsos o que el Comercio no piensa cumplir.</li>
          <li>
            Negar sin motivo un cupón vigente a quien presenta un QR válido, o
            discriminar a las personas que usan la App.
          </li>
          <li>
            Publicar contenido ofensivo, ilegal o que infrinja derechos de
            terceros.
          </li>
          <li>
            Intentar acceder sin autorización a la App o a otras cuentas, o
            manipular la validación de los QR.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="9. Retiro y suspensión">
        <p>
          El Comercio puede retirarse cuando quiera escribiendo a {mail}. Los QR
          que las personas mostraron antes del retiro se deben honrar. Discount
          Maps puede suspender o retirar a un Comercio que incumpla estos
          términos o que acumule quejas fundadas, informándole el motivo.
        </p>
      </LegalSection>

      <LegalSection title="10. Responsabilidad">
        <p>
          Discount Maps hace su mejor esfuerzo para que la App funcione de forma
          continua, pero puede tener interrupciones. No garantiza un número
          mínimo de clientes ni de ventas. El Comercio responde ante las
          personas por sus productos, servicios y cupones, y mantendrá indemne a
          Discount Maps frente a reclamos que se deriven de ellos o del
          contenido que entregue.
        </p>
      </LegalSection>

      <LegalSection title="11. Relación entre las partes">
        <p>
          Estos términos no crean una sociedad, una relación laboral, de agencia
          ni de representación entre Discount Maps y el Comercio. Cada uno es
          independiente y responde por sus propias obligaciones.
        </p>
      </LegalSection>

      <LegalSection title="12. Datos personales">
        <p>
          Los datos del Comercio y de quien lo registra se tratan según la{' '}
          <Link href="/privacidad" className="text-brand-600 underline">
            Política de tratamiento de datos personales
          </Link>
          , que forma parte de estos términos.
        </p>
      </LegalSection>

      <LegalSection title="13. Cambios a estos términos">
        <p>
          Si cambiamos estos términos de forma importante, avisaremos al
          Comercio por correo o en la App con al menos 15 días de anticipación.
          Si sigue publicando cupones después de esa fecha, entenderemos que los
          acepta; si no, puede retirarse.
        </p>
      </LegalSection>

      <LegalSection title="14. Ley aplicable y contacto">
        <p>
          Estos términos se rigen por las leyes de Colombia, incluidas la Ley
          1480 de 2011 y la Ley 527 de 1999; las aceptaciones electrónicas en la
          App tienen plena validez. Cualquier diferencia se intentará resolver
          primero de forma directa, escribiendo a {mail}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
