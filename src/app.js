import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import statusHistoryRoutes from "./routes/statusHistory.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import googleRoutes from "./routes/google.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import cookieParser from "cookie-parser";
import spaceRoutes from "./routes/space.routes.js";
import spaceMemberRoutes from "./routes/spaceMember.routes.js";
import spaceInvitationRoutes from "./routes/spaceInvitation.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// All routes under /api prefix for consistency
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/tickets", commentRoutes);
app.use("/api/tickets", statusHistoryRoutes);
app.use("/api/tickets", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/oauth", googleRoutes); // renamed from /api/auth to avoid conflict
app.use("/api/tags", tagRoutes);
app.use("/api/spaces", spaceRoutes);
app.use("/api/spaces", spaceMemberRoutes);
app.use("/api", spaceInvitationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MiniDesk API Running 🚀",
  });
});

// Centralized error handler — logs stack and returns JSON
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
  });
});

// Global error handler - MUST be last
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

export default app;
