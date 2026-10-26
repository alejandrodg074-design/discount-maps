import type { Metadata } from 'next';
import {
  LegalList,
  LegalPage,
  LegalSection,
} from '../../components/legal-page';
import { LEGAL_ENTITY } from '../../lib/legal';

export const metadata: Metadata = {
  title: 'Política de tratamiento de datos personales',
};

/**
 * Data protection policy required by Ley 1581 de 2012 and Decreto 1377 de 2013
 * (content per art. 13, compiled in Decreto 1074 de 2015). It must describe
 * what the app really stores: see `supabase/migrations` before editing, and
 * bump `LEGAL_VERSION` on material changes.
 */
export default function PrivacyPage() {
  const e = LEGAL_ENTITY;
  const mail = (
    <a href={`mailto:${e.email}`} className="text-brand-600 underline">
      {e.email}
    </a>
  );
  return (
    <LegalPage title="Política de tratamiento de datos personales">
      <p>
        Esta política explica qué datos personales recogemos en Discount Maps
        (la «App»), para qué los usamos, con quién los compartimos y cómo puedes
        ejercer tus derechos, conforme a la Ley 1581 de 2012 y sus decretos
        reglamentarios.
      </p>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          {e.name}, identificado(a) con {e.id}, domicilio en {e.city}, dirección{' '}
          {e.address}, correo {mail}, teléfono {e.phone}.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recogemos">
        <p>
          <strong>De las personas usuarias:</strong>
        </p>
        <LegalList>
          <li>Nombre, correo electrónico y, si lo agregas, teléfono.</li>
          <li>
            Contraseña, que se guarda cifrada: nadie de nuestro equipo puede
            verla.
          </li>
          <li>
            Datos de la suscripción y los pagos: estado, fechas, valores,
            franquicia y últimos cuatro dígitos de la tarjeta, y el
            identificador del medio de pago en Wompi. El número completo de la
            tarjeta lo recibe y protege Wompi; nosotros no lo conocemos.
          </li>
          <li>
            Uso de cupones: qué cupón usaste, en qué Comercio y sede, y cuándo.
            También los Comercios que sigues y si activaste las notificaciones.
          </li>
          <li>
            Ubicación: si das permiso, el navegador nos entrega tu ubicación
            para mostrarte los Comercios cercanos en el mapa. La usamos en el
            momento de la búsqueda y no la guardamos.
          </li>
        </LegalList>
        <p>
          <strong>De los Comercios:</strong> nombre y correo de quien registra
          la cuenta, razón social, NIT, nombre comercial, categoría, logo,
          descripción, sedes (dirección, ciudad, ubicación y teléfono) y los
          cupones que publica.
        </p>
        <p>
          No pedimos datos sensibles (como salud, origen étnico, orientación
          política o religiosa, o biométricos). La App no está dirigida a
          menores de 18 años y no recogemos datos de ellos a sabiendas.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <LegalList>
          <li>Crear y administrar tu cuenta y permitirte iniciar sesión.</li>
          <li>
            Prestar el servicio: mostrarte Comercios y cupones, generar tus
            códigos QR y registrar su uso.
          </li>
          <li>
            Cobrar la suscripción, gestionar reintentos, cancelaciones,
            retractos y reembolsos.
          </li>
          <li>
            Mostrar al Comercio tu nombre cuando valida tu cupón, para que sepa
            a quién lo aplica.
          </li>
          <li>
            Enviarte correos necesarios del servicio (confirmación de cuenta,
            cambio de contraseña, avisos de pago o cambios en las condiciones)
            y, si las activas, notificaciones de nuevos cupones de los Comercios
            que sigues.
          </li>
          <li>
            Verificar a los Comercios y publicar su información en la App.
          </li>
          <li>
            Atender peticiones, quejas y reclamos, prevenir fraudes y usos
            indebidos, y cumplir obligaciones legales, contables y tributarias.
          </li>
          <li>
            Elaborar estadísticas agregadas (por ejemplo, cuántos cupones se
            usan por Comercio) que no te identifican.
          </li>
        </LegalList>
        <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
      </LegalSection>

      <LegalSection title="4. Con quién los compartimos">
        <p>
          Usamos proveedores que tratan los datos por cuenta nuestra
          (encargados), solo para prestar el servicio:
        </p>
        <LegalList>
          <li>Supabase: base de datos, inicio de sesión y archivos.</li>
          <li>Vercel: alojamiento de la App.</li>
          <li>Wompi (Bancolombia): procesamiento de pagos.</li>
          <li>Resend: envío de correos.</li>
          <li>Google Maps: mapa y búsqueda de direcciones.</li>
          <li>
            Los servicios de notificaciones de tu navegador (Google, Apple o
            Mozilla), si activas las notificaciones.
          </li>
        </LegalList>
        <p>
          Algunos de estos proveedores tienen sus servidores fuera de Colombia
          (por ejemplo, en Estados Unidos o Brasil). Al aceptar esta política
          autorizas esa transferencia y transmisión internacional de datos, que
          hacemos con proveedores que ofrecen medidas de seguridad adecuadas.
          También entregaremos datos a autoridades cuando una ley o una orden
          judicial lo exija.
        </p>
      </LegalSection>

      <LegalSection title="5. Tus derechos">
        <p>Como titular de los datos puedes:</p>
        <LegalList>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de la autorización que nos diste.</li>
          <li>Saber qué uso le hemos dado a tus datos.</li>
          <li>
            Revocar la autorización o pedir que eliminemos tus datos, cuando no
            exista un deber legal o contractual de conservarlos.
          </li>
          <li>Acceder gratis a tus datos.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio
            después de haber hecho tu consulta o reclamo ante nosotros.
          </li>
        </LegalList>
        <p>
          Puedes actualizar tu nombre y teléfono directamente en «Cuenta» dentro
          de la App.
        </p>
      </LegalSection>

      <LegalSection title="6. Cómo ejercer tus derechos">
        <p>
          Escribe a {mail} desde el correo de tu cuenta, indicando tu nombre, tu
          solicitud y, si es un reclamo, los hechos y documentos que quieras
          hacer valer.
        </p>
        <LegalList>
          <li>
            <strong>Consultas</strong> (qué datos tenemos y cómo los usamos):
            respondemos en máximo diez (10) días hábiles, prorrogables cinco (5)
            días hábiles más avisándote el motivo.
          </li>
          <li>
            <strong>Reclamos</strong> (corrección, actualización, eliminación o
            revocatoria): respondemos en máximo quince (15) días hábiles,
            prorrogables ocho (8) días hábiles más avisándote el motivo. Si el
            reclamo está incompleto te pediremos completarlo dentro de los cinco
            (5) días siguientes; si pasan dos (2) meses sin respuesta,
            entenderemos que desististe.
          </li>
        </LegalList>
        <p>
          El responsable de atender estas solicitudes es {e.name}, a través del
          correo indicado.
        </p>
      </LegalSection>

      <LegalSection title="7. Seguridad">
        <p>
          Protegemos los datos con conexiones cifradas (HTTPS), contraseñas
          cifradas, controles de acceso por usuario en la base de datos y acceso
          restringido para nuestro equipo. Ningún sistema es infalible: si
          ocurre un incidente que afecte tus datos, te avisaremos y lo
          reportaremos a la autoridad como exige la ley.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          La App usa solo las cookies necesarias para mantener tu sesión
          iniciada. No usamos cookies de publicidad ni de seguimiento.
        </p>
      </LegalSection>

      <LegalSection title="9. Cuánto tiempo guardamos los datos">
        <p>
          Mientras tu cuenta esté activa y luego el tiempo necesario para
          atender reclamos y cumplir la ley. Los registros de pagos se guardan
          por el término que exigen las normas contables y tributarias (hasta
          diez años). Cuando pides la eliminación de tu cuenta, borramos o
          anonimizamos el resto de tus datos.
        </p>
      </LegalSection>

      <LegalSection title="10. Autorización y vigencia">
        <p>
          Al crear tu cuenta y marcar la casilla de aceptación nos das tu
          autorización previa, expresa e informada para tratar tus datos según
          esta política; guardamos la fecha y la versión que aceptaste como
          prueba. Esta política rige desde la fecha de actualización indicada
          arriba. Si la cambiamos de forma importante te avisaremos antes por
          correo o en la App.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
