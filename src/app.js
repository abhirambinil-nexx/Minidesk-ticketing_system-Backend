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
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tickets", ticketRoutes);
app.use("/tickets", commentRoutes);
app.use("/tickets", statusHistoryRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/auth", googleRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "MiniDesk API Running 🚀",
  });
});

export default app;
