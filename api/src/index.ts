import cors from "cors";
import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { healthRouter } from "./routes/health";
import { payrollRouter } from "./routes/payroll";
import { swapsRouter } from "./routes/swaps";

dotenv.config();

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }));
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/swaps", swapsRouter);
  app.use("/payroll", payrollRouter);

  app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 4000);
  createApp().listen(port, () => console.log(`ShiftPal API running on :${port}`));
}
