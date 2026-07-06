import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import statusHistoryRoutes from "./routes/statusHistory.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import googleRoutes from "./routes/google.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import cookieParser from "cookie-parser";
import spaceRoutes from "./routes/space.routes.js";

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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/oauth", googleRoutes);  // renamed from /api/auth to avoid conflict
app.use("/api/tags", tagRoutes);
app.use("/api/spaces", spaceRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "MiniDesk API Running 🚀",
  });
});

export default app;