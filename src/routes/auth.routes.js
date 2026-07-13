import express from "express";

import {
  signupUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, signupUser);
router.post("/login", authLimiter, loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logoutUser);

export default router;
