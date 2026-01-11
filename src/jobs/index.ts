import { startCaducidadJob } from "./caducarReservas.job";

export function startJobs() {
  const enabled = String(process.env.CADUCIDAD_JOB_ENABLED ?? "true") === "true";
  const schedule = String(process.env.CADUCIDAD_JOB_SCHEDULE ?? "*/5 * * * *"); // cada 5 min
  const batchSize = Number(process.env.CADUCIDAD_JOB_BATCH ?? 200);

  startCaducidadJob({
    enabled,
    schedule,
    batchSize: Number.isFinite(batchSize) ? batchSize : 200,
  });
}
