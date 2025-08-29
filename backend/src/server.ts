import express from "express";
import cors from "cors";
import morgan from "morgan";
import satellitesRouter from "./routes/satellites.js";
import watchlistRouter from "./routes/watchlist.js";
import { JsonStorage } from "./storage/jsonStorage.js";
import { fetchStarlinkTLE } from "./services/celestrak.js";
import { scheduleTLEJob } from "./cron.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/satellites", satellitesRouter);
app.use("/api/watchlist", watchlistRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

async function bootstrap() {
  const storage = new JsonStorage();
  const current = await storage.readTLE();
  if (current.length === 0) {
    console.log("[init] Fetching Starlink TLE...");
    try {
      const list = await fetchStarlinkTLE();
      await storage.writeTLE(list);
      console.log(`[init] TLE loaded: ${list.length}`);
    } catch (e) {
      console.warn("[init] Fetch failed, starting with empty dataset");
      await storage.writeTLE([]);
    }
  }

  scheduleTLEJob();

  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

bootstrap();
