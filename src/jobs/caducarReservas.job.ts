// src/jobs/caducarReservas.job.ts
import cron from "node-cron";
import { CaducarReservasService } from "../services/reservas/caducar-reservas.service";

type StartCaducidadJobOptions = {
  enabled: boolean;
  schedule: string;
  batchSize: number;
};

export function startCaducidadJob(opts: StartCaducidadJobOptions) {
  if (!opts.enabled) return;

  let running = false;

  cron.schedule(
    opts.schedule,
    async () => {
      if (running) return;
      running = true;

      try {
        const res = await CaducarReservasService.ejecutar({
          batchSize: opts.batchSize,
        });

        if (res.caducadas > 0) {
          console.log(
            `🕒 [caducidad] scanned=${res.scanned} caducadas=${res.caducadas} ids=${res.ids.join(",")}`
          );
        } else {
          console.log("🕒 [caducidad] ok — sin reservas a caducar");
        }

        // 🧠 Defensa observabilidad (opcional)
        if (res.scanned !== res.caducadas) {
          console.warn(
            `⚠️ [caducidad] mismatch scanned=${res.scanned} caducadas=${res.caducadas}`
          );
        }
      } catch (e: any) {
        console.error("❌ [caducidad job] error:", e?.message ?? e);
      } finally {
        running = false;
      }
    },
    {
      timezone: "America/Santiago",
    }
  );

  console.log("⏱️ Job caducidad reservas iniciado");
}
