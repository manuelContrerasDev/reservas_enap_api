import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  console.log("📌 Conectado a:", process.env.DATABASE_URL);

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables
    WHERE table_schema = 'public';
  `);

  console.log("📋 Tablas en la base de datos:");
  console.table(res.rows);

  await client.end();
}

main().catch(err => console.error(err));
