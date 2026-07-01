import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  activateUser,
  deactivateUser,
  changeUserRole,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", authenticate, (req, res) => {
  res.json(req.user);
});

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

router.get("/", authenticate, authorize("admin"), getAllUsers);

router.get("/:id", authenticate, authorize("admin"), getUserById);

router.post("/", authenticate, authorize("admin"), createUser);

router.patch("/:id", authenticate, authorize("admin"), updateUser);

router.patch("/:id/role", authenticate, authorize("admin"), changeUserRole);

router.patch("/:id/activate", authenticate, authorize("admin"), activateUser);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("admin"),
  deactivateUser,
);

export default router;
