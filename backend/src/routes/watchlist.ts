import { Router } from "express";
import { JsonStorage } from "../storage/jsonStorage.js";

const router = Router();
const storage = new JsonStorage();

router.get("/", async (_req, res) => {
  const list = await storage.readWatchlist();
  res.json({ items: list });
});

router.post("/", async (req, res) => {
  const { id } = req.body as { id?: string };
  if (!id) return res.status(400).json({ error: "id required" });
  await storage.addToWatchlist(id);
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  await storage.removeFromWatchlist(req.params.id);
  res.json({ ok: true });
});

export default router;
