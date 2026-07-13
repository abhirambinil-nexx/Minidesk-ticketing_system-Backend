import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/User.js";
import "./models/RefreshToken.js";
import "./config/redis.js";
import "./models/Tag.js";
import "./models/TicketTag.js";
import "./models/index.js";
// import "./workers/email.worker.js";
// import "./workers/escalation.worker.js";
// import { scheduleEscalationSweep } from "./queues/escalation.queue.js";

// inside startServer(), after app.listen:

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected");

    await sequelize.sync();

    console.log("✅ Database Synced");

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
    // await scheduleEscalationSweep();
    // console.log("✅ BullMQ workers running, escalation sweep scheduled");
  } catch (error) {
    console.error(error);
  }
}

startServer();
