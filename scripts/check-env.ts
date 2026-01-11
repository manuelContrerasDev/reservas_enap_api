import dotenv from "dotenv";
dotenv.config();

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
  "WEB_URL",
  "PAYMENT_PROVIDER",
  "FLOW_API_KEY",
  "FLOW_SECRET",
  "FLOW_BASE_URL",
  "FLOW_RETURN_URL",
  "FLOW_CONFIRMATION_URL",
  "MP_ACCESS_TOKEN",
  "MP_RETURN_URL",
  "MP_NOTIFICATION_URL"
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error("❌ Faltan variables en .env:");
  console.error(missing.map((v) => ` - ${v}`).join("\n"));
  process.exit(1);
} else {
  console.log("✅ Todas las variables de entorno están presentes.");
}
