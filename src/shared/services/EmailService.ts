import * as Brevo from "@getbrevo/brevo";

/* ============================================================
 * 🔧 CONFIG
 * ============================================================ */

const apiKey = process.env.BREVO_API_KEY ?? "";
const fromEmail = process.env.BREVO_FROM_EMAIL ?? "";
const fromName = process.env.BREVO_FROM_NAME ?? "ENAP Reservas";

const emailEnabled =
  process.env.ENABLE_EMAIL === "true" ||
  process.env.NODE_ENV === "production";

/* ============================================================
 * 🔐 LOGS
 * ============================================================ */
console.log("\n📨 EmailService inicializando...");
console.log("BREVO_API_KEY:", apiKey ? "✔ OK" : "❌ FALTA");
console.log("BREVO_FROM_EMAIL:", fromEmail || "❌ FALTA");
console.log("BREVO_FROM_NAME:", fromName || "❌ FALTA");
console.log("EMAIL_ENABLED:", emailEnabled ? "✔ ACTIVADO" : "⚠️ DESACTIVADO");

if (!apiKey) {
  console.log("❌ Advertencia: sin BREVO_API_KEY no se enviarán emails reales.");
}

/* ============================================================
 * 🔐 CLIENTE BREVO
 * ============================================================ */
const brevoClient = new Brevo.TransactionalEmailsApi();

if (apiKey && emailEnabled) {
  brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  console.log("🔑 Cliente Brevo configurado — Emails REALES habilitados\n");
} else {
  console.log("⚠️ Envío real DESACTIVADO — modo desarrollo o emailEnabled=false\n");
}

/* ============================================================
 * 🛡 ESCAPAR HTML
 * ============================================================ */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ============================================================
 * 📌 CORE SEND
 * ============================================================ */
async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!emailEnabled) {
    console.log("\n📧 (DEV) Simulando email a:", to);
    console.log("📌 Asunto:", subject);
    console.log("📝 HTML:", html);
    return true;
  }

  try {
    const response = await brevoClient.sendTransacEmail({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("✔ Email enviado →", response?.body?.messageId);
    return true;
  } catch (err: any) {
    console.error("❌ Error enviando correo:", err?.response?.body || err);
    return false;
  }
}

/* ============================================================
 * 📌 TEMPLATES
 * ============================================================ */
const Templates = {
  confirmEmail(name: string, url: string) {
    return `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hola ${escapeHtml(name)},</h2>
        <p>Gracias por registrarte en <b>ENAP Reservas</b>.</p>
        <p>Confirma tu correo haciendo clic aquí:</p>
        <a href="${url}" style="font-size: 16px; color: #0066cc;">${url}</a>
        <br/><br/>
        <p>Si no realizaste esta acción, ignora este mensaje.</p>
      </div>
    `;
  },

  resetPassword(name: string, url: string) {
    return `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hola ${escapeHtml(name)},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic aquí:</p>
        <a href="${url}" style="font-size: 16px; color: #0066cc;">${url}</a>
        <br/><br/>
        <p>Si no fuiste tú, ignora este mensaje.</p>
      </div>
    `;
  },

  manualReservation(name: string, fecha: string, espacio: string, pagoUrl: string) {
    return `
      <div style="font-family: Arial; padding: 26px; color: #333;">
        <h2 style="color:#003366; margin-bottom: 12px;">Hola ${escapeHtml(name)},</h2>

        <p>
          Se ha registrado una nueva reserva a tu nombre en la plataforma 
          <b>ENAP Reservas</b>.
        </p>

        <div style="margin:16px 0; padding:12px 16px; background:#f2f6ff; border-left:4px solid #0b6efd;">
          <p><b>Espacio:</b> ${escapeHtml(espacio)}</p>
          <p><b>Fecha:</b> ${escapeHtml(fecha)}</p>
        </div>

        <p>Puedes completar el pago usando el siguiente enlace:</p>

        <a href="${escapeHtml(pagoUrl)}"
          style="display:inline-block; margin-top:10px; padding:12px 22px;
                background:#0b6efd; color:white; text-decoration:none;
                border-radius:6px; font-weight:bold;">
          Completar Pago
        </a>

        <br/><br/>

        <p style="font-size:13px; color:#666;">
          Si tienes dudas, por favor comunícate con administración del Centro Recreativo ENAP.
        </p>
      </div>
    `;
  },

};

/* ============================================================
 * 📌 API DEL SERVICIO
 * ============================================================ */
export const EmailService = {
  async sendConfirmEmail({
    to,
    name,
    confirmUrl,
  }: {
    to: string;
    name: string | null;
    confirmUrl: string;
  }) {
    const safeName =
      name && name.trim().length > 0 ? name.trim() : "Socio ENAP";

    const html = Templates.confirmEmail(safeName, confirmUrl);
    return sendEmail({
      to,
      subject: "Confirma tu cuenta — ENAP Reservas",
      html,
    });
  },

  async sendResetPasswordEmail({
    to,
    name,
    resetUrl,
  }: {
    to: string;
    name: string | null;
    resetUrl: string;
  }) {
    const safeName =
      name && name.trim().length > 0 ? name.trim() : "Socio ENAP";

    const html = Templates.resetPassword(safeName, resetUrl);
    return sendEmail({
      to,
      subject: "Restablecer contraseña — ENAP Reservas",
      html,
    });
  },

  //ADMIN- RESERVA-MANUAL
  async sendManualReservationEmail({
    to,
    name,
    fecha,
    espacio,
    pagoUrl,
  }: {
    to: string;
    name: string | null;
    fecha: string;
    espacio: string;
    pagoUrl: string;
  }) {
    const safeName =
      name && name.trim().length > 0 ? name.trim() : "Usuario ENAP";

    const html = Templates.manualReservation(safeName, fecha, espacio, pagoUrl);

    return sendEmail({
      to,
      subject: "Nueva reserva registrada — ENAP Reservas",
      html,
    });
  },

};
