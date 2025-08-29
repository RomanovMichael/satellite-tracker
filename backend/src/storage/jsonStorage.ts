import fs from "fs/promises";
import path from "path";
import { StorageAdapter } from "./storage.js";
import { TLERecord } from "../types.js";

// Стабильная директория данных рядом с backend/
const DATA_DIR = path.resolve(process.cwd(), "data");
const TLE_FILE = path.join(DATA_DIR, "satellites.json");
const WATCHLIST_FILE = path.join(DATA_DIR, "watchlist.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(TLE_FILE); } catch { await fs.writeFile(TLE_FILE, "[]"); }
  try { await fs.access(WATCHLIST_FILE); } catch { await fs.writeFile(WATCHLIST_FILE, "[]"); }
}

export class JsonStorage implements StorageAdapter {
  constructor() { void ensureFiles(); }

  async readTLE(): Promise<TLERecord[]> {
    await ensureFiles();
    const raw = await fs.readFile(TLE_FILE, "utf-8");
    try { return JSON.parse(raw); } catch { return []; }
  }

  async writeTLE(list: TLERecord[]): Promise<void> {
    await ensureFiles();
    await fs.writeFile(TLE_FILE, JSON.stringify(list, null, 2), "utf-8");
  }

  async readWatchlist(): Promise<string[]> {
    await ensureFiles();
    const raw = await fs.readFile(WATCHLIST_FILE, "utf-8");
    try { return JSON.parse(raw); } catch { return []; }
  }

  async addToWatchlist(noradId: string): Promise<void> {
    const list = await this.readWatchlist();
    if (!list.includes(noradId)) {
      list.push(noradId);
      await fs.writeFile(WATCHLIST_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  }

  async removeFromWatchlist(noradId: string): Promise<void> {
    const list = await this.readWatchlist();
    const next = list.filter((id) => id !== noradId);
    await fs.writeFile(WATCHLIST_FILE, JSON.stringify(next, null, 2), "utf-8");
  }
}
