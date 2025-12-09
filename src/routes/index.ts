// src/routes/index.ts
import { Router } from "express";

import authRoutes from "./auth.routes";
import espaciosRoutes from "./espacios.routes";
import reservasRoutes from "./reservas.routes";
import pagosRoutes from "./pagos.routes";
import guestAuthRoutes from "./guestAuth.routes";
import debugRoutes from "./debug.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/espacios", espaciosRoutes);
router.use("/reservas", reservasRoutes);
router.use("/pagos", pagosRoutes);
router.use("/guest-authorizations", guestAuthRoutes);
router.use("/debug", debugRoutes);

export default router;
