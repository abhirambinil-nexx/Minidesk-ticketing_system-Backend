import express from "express";
import * as commentController from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/:ticketId/comments", commentController.createComment);

router.get("/:ticketId/comments", commentController.getComments);

export default router;