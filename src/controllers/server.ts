import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.ts";
import authRoutes from "./src/routes/authRoutes.ts";
import taskRoutes from "./src/routes/taskRoutes.ts";
import errorHandler from "./src/middleware/error.ts";
import { checkDB } from "./src/middleware/dbCheck.ts";

dotenv.config();

async function startServer() {
  // Database connection
  console.log('--- Server Startup ---');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured (masked)' : 'NOT CONFIGURED - using localhost fallback'}`);
  
  await connectDB();

  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // Enable CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Session middleware
  const sessionOptions: any = {
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  };

  if (process.env.MONGODB_URI) {
    try {
      sessionOptions.store = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
      });
      console.log("Using MongoDB for session storage");
    } catch (error) {
      console.error("Failed to initialize MongoStore:", error);
    }
  } else {
    console.log("Using MemoryStore for session storage (development only)");
  }

  app.use(session(sessionOptions));

  // API Routes
  app.use("/api/auth", checkDB, authRoutes);
  app.use("/api/tasks", checkDB, taskRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "TaskFlow API is running" });
  });

  // Error handler middleware
  app.use(errorHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Vite middleware initialized: ${process.env.NODE_ENV !== "production"}`);
  });
}

startServer();
