import { TLERecord } from "../types.js";

export interface StorageAdapter {
  readTLE(): Promise<TLERecord[]>;
  writeTLE(list: TLERecord[]): Promise<void>;

  readWatchlist(): Promise<string[]>;
  addToWatchlist(noradId: string): Promise<void>;
  removeFromWatchlist(noradId: string): Promise<void>;
}
