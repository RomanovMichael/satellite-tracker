import * as sat from "satellite.js";
import { TLERecord } from "../types.js";

export function positionFromTLE(tle: TLERecord, at: Date) {
  const rec = sat.twoline2satrec(tle.line1, tle.line2);
  const pv = sat.propagate(rec, at);
  if (!pv.position) return null;
  const gmst = sat.gstime(at);
  const gd = sat.eciToGeodetic(pv.position, gmst);
  const lat = sat.degreesLat(gd.latitude);
  const lon = sat.degreesLong(gd.longitude);
  const altKm = gd.height;
  return { lat, lon, altKm };
}

export function groundTrack(tle: TLERecord, minutes = 90, stepSec = 30, from = new Date()) {
  const rec = sat.twoline2satrec(tle.line1, tle.line2);
  const points: Array<{ lat: number; lon: number }> = [];
  for (let t = 0; t <= minutes * 60; t += stepSec) {
    const at = new Date(from.getTime() + t * 1000);
    const pv = sat.propagate(rec, at);
    if (!pv.position) continue;
    const gmst = sat.gstime(at);
    const gd = sat.eciToGeodetic(pv.position, gmst);
    points.push({ lat: sat.degreesLat(gd.latitude), lon: sat.degreesLong(gd.longitude) });
  }
  return points;
}
