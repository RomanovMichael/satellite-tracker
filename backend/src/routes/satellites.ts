import { Router } from "express";
import { JsonStorage } from "../storage/jsonStorage.js";
import { groundTrack, positionFromTLE } from "../services/orbit.js";

const router = Router();
const storage = new JsonStorage();

router.get("/", async (req, res) => {
  const q = (req.query.q as string)?.trim()?.toLowerCase() ?? "";
  const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
  const pageSize = Math.min(500, Math.max(10, parseInt((req.query.pageSize as string) || "200", 10)));
  const list = await storage.readTLE();

  const filtered = q
    ? list.filter(r => r.name.toLowerCase().includes(q) || r.noradId.includes(q))
    : list;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(({ line1, line2, ...rest }) => rest);

  res.json({ page, pageSize, total, items });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const list = await storage.readTLE();
  const rec = list.find(r => r.noradId === id);
  if (!rec) return res.status(404).json({ error: "Not found" });
  res.json(rec);
});

router.get("/:id/ground-track", async (req, res) => {
  const id = req.params.id;
  const minutes = parseInt((req.query.minutes as string) || "90", 10);
  const step = parseInt((req.query.step as string) || "30", 10);
  const list = await storage.readTLE();
  const rec = list.find(r => r.noradId === id);
  if (!rec) return res.status(404).json({ error: "Not found" });
  const points = groundTrack(rec, minutes, step, new Date());
  res.json({ id, points });
});

router.get("/positions", async (req, res) => {
  const ids = ((req.query.ids as string) || "").split(",").map(s => s.trim()).filter(Boolean);
  const atStr = req.query.at as string | undefined;
  const at = atStr ? new Date(atStr) : new Date();
  if (!ids.length) return res.json({ items: [] });
  const list = await storage.readTLE();
  const map = new Map(list.map(r => [r.noradId, r]));
  const items = ids.map(id => {
    const tle = map.get(id);
    if (!tle) return { id, error: "not-found" };
    const pos = positionFromTLE(tle, at);
    return pos ? { id, ...pos } : { id, error: "no-pos" };
  });
  res.json({ at: at.toISOString(), items });
});

export default router;
