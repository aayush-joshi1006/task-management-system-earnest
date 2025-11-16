import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import tasksRoutes from "./routes/tasks.routes";
dotenv.config();

const app = express();

// configure CORS to allow your frontend origin(s)
app.use(
  cors({
    origin: ["http://localhost:3000"], // add your frontend URL(s)
    credentials: true, // allows cookies to be sent
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);

app.get("/", (req, res) => res.json({ message: "API running" }));

export default app;
