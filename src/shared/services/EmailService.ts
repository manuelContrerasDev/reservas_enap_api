// src/shared/services/EmailService.ts
import * as Brevo from "@getbrevo/brevo";
import { env, EMAIL_ENABLED } from "@/config/env";

/* ============================================================
 * 🔐 CONFIG CENTRALIZADA
 * ============================================================ */
const fromEmail = env.BREVO_FROM_EMAIL ?? "";
const fromName = env.BREVO_FROM_NAME ?? "ENAP Reservas";

/* ============================================================
 * 🛡 LOG CONTROLADO (solo DEV)
 * ============================================================ */
if (env.NODE_ENV !== "production") {
  console.log("\n📨 EmailService init");
  console.log("EMAIL_ENABLED:", EMAIL_ENABLED ? "ON" : "OFF");
  console.log("BREVO_API_KEY:", env.BREVO_API_KEY ? "OK" : "MISSING");
}

/* ============================================================
 * 🔐 CLIENTE BREVO
 * ============================================================ */
const brevoClient = new Brevo.TransactionalEmailsApi();

if (EMAIL_ENABLED && env.BREVO_API_KEY) {
  brevoClient.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    env.BREVO_API_KEY
  );
}

/* ============================================================
 * 🛡 ESCAPE HTML (completo)
 * ============================================================ */
function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
 * 🔐 ESCAPE URL SEGURA
 * ============================================================ */
function escapeUrl(url: string) {
  return escapeHtml(url);
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
  // 🔧 DEV / EMAIL OFF → simular
  if (!EMAIL_ENABLED) {
    if (env.NODE_ENV !== "production") {
      console.log("\n📧 (DEV) Email simulado");
      console.log("To:", to);
      console.log("Subject:", subject);
    }
    return true;
  }

  // 🔴 Config inválida (ya validada por env.ts, pero fail-safe)
  if (!env.BREVO_API_KEY || !fromEmail) {
    console.error("❌ EmailService: configuración incompleta");
    return false;
  }

  try {
    await brevoClient.sendTransacEmail({
      sender: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    return true;
  } catch (err: any) {
    console.error("❌ Error enviando email:", err?.response?.body || err);
    return false;
  }
}

/* ============================================================
 * 📌 TEMPLATES
 * ============================================================ */
const Templates = {
  confirmEmail(name: string, url: string) {
    const safeUrl = escapeUrl(url);
    return `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hola ${escapeHtml(name)},</h2>
        <p>Gracias por registrarte en <b>ENAP Reservas</b>.</p>
        <p>Confirma tu correo haciendo clic aquí:</p>
        <a href="${safeUrl}" style="color:#0066cc;">${safeUrl}</a>
        <p>Si no realizaste esta acción, ignora este mensaje.</p>
      </div>
    `;
  },

  resetPassword(name: string, url: string) {
    const safeUrl = escapeUrl(url);
    return `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hola ${escapeHtml(name)},</h2>
        <p>Solicitud para restablecer tu contraseña.</p>
        <a href="${safeUrl}" style="color:#0066cc;">${safeUrl}</a>
        <p>Si no fuiste tú, ignora este mensaje.</p>
      </div>
    `;
  },

  manualReservation(
    name: string,
    fecha: string,
    espacio: string,
    pagoUrl: string
  ) {
    const safeUrl = escapeUrl(pagoUrl);
    return `
      <div style="font-family: Arial; padding: 26px;">
        <h2>Hola ${escapeHtml(name)},</h2>
        <p>Se ha registrado una nueva reserva.</p>
        <p><b>Espacio:</b> ${escapeHtml(espacio)}</p>
        <p><b>Fecha:</b> ${escapeHtml(fecha)}</p>
        <a href="${safeUrl}" style="background:#0b6efd;color:white;padding:12px 20px;border-radius:6px;">
          Completar pago
        </a>
      </div>
    `;
  },
};

/* ============================================================
 * 📌 API PÚBLICA
 * ============================================================ */
export const EmailService = {
  sendConfirmEmail({ to, name, confirmUrl }: any) {
    return sendEmail({
      to,
      subject: "Confirma tu cuenta — ENAP Reservas",
      html: Templates.confirmEmail(name?.trim() || "Socio ENAP", confirmUrl),
    });
  },

  sendResetPasswordEmail({ to, name, resetUrl }: any) {
    return sendEmail({
      to,
      subject: "Restablecer contraseña — ENAP Reservas",
      html: Templates.resetPassword(name?.trim() || "Socio ENAP", resetUrl),
    });
  },

  sendManualReservationEmail(data: any) {
    return sendEmail({
      to: data.to,
      subject: "Nueva reserva registrada — ENAP Reservas",
      html: Templates.manualReservation(
        data.name?.trim() || "Usuario ENAP",
        data.fecha,
        data.espacio,
        data.pagoUrl
      ),
    });
  },
};
