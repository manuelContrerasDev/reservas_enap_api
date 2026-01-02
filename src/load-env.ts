// src/load-env.ts
import dotenv from "dotenv";
import path from "path";

const NODE_ENV = process.env.NODE_ENV || "development";

// 🔹 Solo cargar .env en desarrollo
if (NODE_ENV === "development") {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
  });

  console.log("✔ .env cargado (modo development)");
} else {
  // En producción (Render), las variables vienen del entorno
  console.log("✔ Variables de entorno cargadas desde el sistema");
}
