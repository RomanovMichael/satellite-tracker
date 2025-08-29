import * as sat from 'satellite.js';
import type { TLE } from './types';

export function recFromTLE(tle: TLE) {
  return sat.twoline2satrec(tle.line1, tle.line2);
}

export function posFromTLE(tle: TLE, at = new Date()) {
  const rec = recFromTLE(tle);
  const pv = sat.propagate(rec, at);
  if (!pv.position) return null;
  const gmst = sat.gstime(at);
  const gd = sat.eciToGeodetic(pv.position, gmst);
  return { lat: sat.degreesLat(gd.latitude), lon: sat.degreesLong(gd.longitude), altKm: gd.height };
}

export function groundTrackFromTLE(tle: TLE, minutes = 90, stepSec = 30, from = new Date()) {
  const rec = recFromTLE(tle);
  const pts: Array<[number, number]> = [];
  for (let t = 0; t <= minutes * 60; t += stepSec) {
    const at = new Date(from.getTime() + t * 1000);
    const pv = sat.propagate(rec, at);
    if (!pv.position) continue;
    const gmst = sat.gstime(at);
    const gd = sat.eciToGeodetic(pv.position, gmst);
    pts.push([sat.degreesLong(gd.longitude), sat.degreesLat(gd.latitude)]);
  }
  return pts;
}
