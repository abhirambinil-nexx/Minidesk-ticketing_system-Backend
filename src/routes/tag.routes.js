import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import * as tagController from "../controllers/tag.controller.js";

const router = express.Router();

// Get all tags
router.get("/", authenticate, tagController.getTags);

// Get a single tag
router.get("/:id", authenticate, tagController.getTag);

// Create a tag (Agent & Admin only)
router.post(
  "/",
  authenticate,
  authorize("agent", "admin"),
  tagController.createTag,
);

// Update a tag (Agent & Admin only)
router.patch(
  "/:id",
  authenticate,
  authorize("agent", "admin"),
  tagController.updateTag,
);

// Delete a tag (Agent & Admin only)
router.delete(
  "/:id",
  authenticate,
  authorize("agent", "admin"),
  tagController.deleteTag,
);

export default router;
