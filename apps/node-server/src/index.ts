import express, { NextFunction, Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";
import { startQueueConsumer } from "./workers/queueConsumer";
import { privateRouter } from "./routers/v1/private";
import { publicRouter } from "./routers/v1/public";
import { posthogClient } from "./clients/posthogClient";
import { logFailedRequests } from "./middlewares/logFailedRequests";
import { CronJob } from "cron";
import { populateDemoCalls } from "./utils/demo";
import * as path from 'path';
import * as fs from 'fs/promises';
import { searchRouter } from "./routers/v1/routes/search";
import cors from 'cors';


// Updated implementation
const app = express();
const httpServer = createServer(app);

// Apply CORS middleware first
app.use(cors({
  origin: ['http://localhost:3001', 'https://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Then apply other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logFailedRequests);
// Updated implementation
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3001", "https://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'] // Explicitly set allowed transports
});

// Ensure the uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    // Directory doesn't exist, create it recursively
    await fs.mkdir(uploadsDir, { recursive: true });

    // Create subdirectories
    await fs.mkdir(path.join(uploadsDir, "calls"), { recursive: true });
    await fs.mkdir(path.join(uploadsDir, "images"), { recursive: true });
    await fs.mkdir(path.join(uploadsDir, "brochures"), { recursive: true });
  }
  return uploadsDir;
};

// Initialize uploads directory
(async () => {
  try {
    await ensureUploadsDir();
    console.log("Uploads directory initialized");
  } catch (error) {
    console.error("Failed to initialize uploads directory:", error);
  }
})();

// Serve static files from the uploads directory
app.use('/files', express.static(path.join(process.cwd(), 'uploads')));

// Add a dedicated route for call recordings
app.get('/files/calls/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'calls', filename);

  // Send the file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error serving file ${filename}:`, err);
      // If file not found or other error
      if (err.code === 'ENOENT') {
        res.status(404).send('File not found');
      } else {
        res.status(500).send('Error serving file');
      }
    }
  });
});

// Error handler for file not found
app.use('/files', (req, res, next) => {
  // This middleware will only run if no previous route handlers responded
  if (!res.headersSent) {
    res.status(404).send('File not found');
  }
});
app.use("/v1/search", searchRouter);

export const connectedUsers = new Map();

io.on("connection", (socket) => {
  let userId: string | null = null;

  socket.on("register", (newUserId) => {
    userId = newUserId;
    connectedUsers.set(userId, socket);
    console.log(`User ${userId} registered`);
    console.log("audio service url", env.AUDIO_SERVICE_URL);
  });

  socket.on("disconnect", () => {
    if (userId) {
      connectedUsers.delete(userId);
    }
  });
});

app.get("/", (req, res) => {
  res.send("ollo");
});

app.use("/internal", privateRouter);
app.use("/", publicRouter);
app.use("/v1", publicRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3003;
const cleanup = () => {
  httpServer.close(async () => {
    console.log("Server closed");
    await posthogClient.shutdown();
    process.exit(0);
  });
};

["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.on(signal, cleanup);
});

const populateDemoCallsCronJob = CronJob.from({
  cronTime: "0 0 * * *", // Runs at midnight every day
  onTick: async () => {
    try {
      console.log("Starting demo calls population...");
      await populateDemoCalls();
      console.log("Finished populating demo calls");
    } catch (error) {
      console.error("Error in demo calls cron job:", error);
    }
  },
  timeZone: "America/Los_Angeles", // Timezone
});

// Start the cron job
if (!env.DEBUG) {
  console.log("=========== Starting populate demo calls cron job ===========");
  populateDemoCallsCronJob.start();
}

// In the index.ts file, where startQueueConsumer is called
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`File storage serving at http://localhost:${PORT}/files`);

  const MOCK_MODE = process.env.NODE_ENV !== 'production' || process.env.SKIP_ENV_VALIDATION === 'true';

  if (MOCK_MODE) {
    console.log("Running in mock mode - using mock queue consumer");
  }

  startQueueConsumer().catch(err => {
    console.error("Error starting queue consumer:", err);
  });
});

