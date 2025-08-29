import cron from "node-cron";
import { fetchStarlinkTLE } from "./services/celestrak.js";
import { JsonStorage } from "./storage/jsonStorage.js";

export function scheduleTLEJob() {
  const storage = new JsonStorage();
  cron.schedule("0 */12 * * *", async () => {
    try {
      const list = await fetchStarlinkTLE();
      await storage.writeTLE(list);
      console.log(`[cron] TLE updated: ${list.length} records`);
    } catch (e) {
      console.error("[cron] TLE update failed", e);
    }
  }, { timezone: "UTC" });
}
