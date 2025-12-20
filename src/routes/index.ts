// src/routes/index.ts
import { Router } from "express";

import authRoutes from "./auth.routes";
import espaciosRoutes from "./espacios.routes";
import reservasRoutes from "./reservas.routes";
import pagosRoutes from "./pagos.routes";

import debugRoutes from "./debug.routes";

import adminReservasRoutes from "./admin/reservas.admin.routes";
import adminUsersRoutes from "./admin/users.admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/espacios", espaciosRoutes);
router.use("/reservas", reservasRoutes);
router.use("/pagos", pagosRoutes);

router.use("/debug", debugRoutes);
router.use("/admin/reservas", adminReservasRoutes);
router.use("/admin/users", adminUsersRoutes);

export default router;
