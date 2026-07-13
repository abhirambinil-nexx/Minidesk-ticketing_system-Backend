import express from "express";
import * as ticketController from "../controllers/ticket.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { ticketCreateLimiter } from "../middleware/rateLimiter.middleware.js";
const router = express.Router();

router.use(authenticate);
router.post("/", ticketCreateLimiter, ticketController.createTicket);
router.get("/", ticketController.getTickets);
router.get("/:id", ticketController.getTicket);
router.patch("/:id", ticketController.updateTicket);
router.delete("/:id", ticketController.deleteTicket);

export default router;
