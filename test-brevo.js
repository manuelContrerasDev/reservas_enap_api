require("dotenv").config();
const Brevo = require("@getbrevo/brevo");

// =========================================================
// PROBAR VARIABLES DE ENTORNO
// =========================================================
console.log("===== TEST VARIABLES DE ENTORNO =====");
console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY);
console.log("BREVO_FROM_EMAIL:", process.env.BREVO_FROM_EMAIL);
console.log("BREVO_FROM_NAME:", process.env.BREVO_FROM_NAME);
console.log("WEB_URL:", process.env.WEB_URL);
console.log("======================================");

// =========================================================
// PROBAR CLIENTE BREVO
// =========================================================
try {
  const client = new Brevo.TransactionalEmailsApi();

  if (!process.env.BREVO_API_KEY) {
    console.log(" ❌ BREVO_API_KEY NO DEFINIDA EN EL .env");
  } else {
    client.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    console.log("Brevo client inicializado correctamente ✔");
  }
} catch (e) {
  console.error("❌ Error creando el cliente Brevo:", e.message);
}
