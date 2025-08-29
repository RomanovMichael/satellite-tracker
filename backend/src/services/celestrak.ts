import axios from "axios";
import { TLERecord } from "../types.js";

const STARLINK_TLE_URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle";

export async function fetchStarlinkTLE(): Promise<TLERecord[]> {
  const { data } = await axios.get<string>(STARLINK_TLE_URL, { responseType: "text" });
  const lines = data.split(/\r?\n/).filter(Boolean);

  const records: TLERecord[] = [];
  for (let i = 0; i < lines.length; ) {
    const nameLine = lines[i++];
    const l1 = lines[i++];
    const l2 = lines[i++];
    if (!nameLine || !l1 || !l2) break;

    const noradId = l2.substring(2, 7).trim();
    records.push({
      name: nameLine.trim(),
      noradId,
      line1: l1.trim(),
      line2: l2.trim(),
      updatedAt: new Date().toISOString(),
    });
  }
  return records;
}
