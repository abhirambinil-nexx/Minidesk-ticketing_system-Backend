import express from "express";
import * as controller from "../controllers/statusHistory.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/:ticketId/history",
  controller.getHistory
);

export default router;