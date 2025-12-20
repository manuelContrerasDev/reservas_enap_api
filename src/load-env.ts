// src/load-env.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("✔ .env cargado desde load-env.ts");
