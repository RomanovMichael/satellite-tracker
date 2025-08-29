import type { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import type { TLE } from "../lib/types";
import { posFromTLE, groundTrackFromTLE } from "../lib/satellite";

export class SatelliteLayer {
  private map: MapLibreMap;
  private tleById = new Map<string, TLE>();
  private selectedId: string | null = null;

  constructor(map: MapLibreMap) {
    this.map = map;
  }

  setData(list: TLE[]) {
    this.tleById.clear();
    for (const t of list) this.tleById.set(t.noradId, t);
    this.ensureSources();
    this.renderOnce();
  }

  select(id: string | null) {
    this.selectedId = id;
    this.renderOrbit();
    this.highlightSelected();
  }

  tick() {
    this.renderOnce();
  }

  private ensureSources() {
    if (!this.map.getSource("sats")) {
      this.map.addSource("sats", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      this.map.addLayer({
        id: "sats",
        type: "circle",
        source: "sats",
        paint: { "circle-radius": 3, "circle-color": "#9ca3af" },
      });
      this.map.addLayer({
        id: "sats-selected",
        type: "circle",
        source: "sats",
        filter: ["==", ["get", "id"], "___none___"],
        paint: { "circle-radius": 4.5, "circle-color": "#fde047" },
      });
    }
    if (!this.map.getSource("orbit")) {
      this.map.addSource("orbit", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      this.map.addLayer({
        id: "orbit-line",
        type: "line",
        source: "orbit",
        paint: {
          "line-width": 1.5,
          "line-color": "#9ca3af",
          "line-dasharray": [2, 2],
        },
      });
      this.map.addLayer({
        id: "orbit-line-selected",
        type: "line",
        source: "orbit",
        filter: ["==", ["get", "id"], "___sel___"],
        paint: { "line-width": 2.5, "line-color": "#fde047" },
      });
    }
  }

  private renderOnce() {
    const features: any[] = [];
    const now = new Date();
    for (const tle of this.tleById.values()) {
      const pos = posFromTLE(tle, now);
      if (!pos) continue;
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [pos.lon, pos.lat] },
        properties: { id: tle.noradId, name: tle.name },
      });
    }
    const satsSrc = this.map.getSource("sats") as GeoJSONSource | undefined;
    if (!satsSrc) {
      this.ensureSources();
      return;
    }
    const geo = { type: "FeatureCollection", features } as const;
    satsSrc.setData(geo as any);
    this.highlightSelected();
  }

  private renderOrbit() {
    const source = this.map.getSource("orbit") as GeoJSONSource | undefined;
    if (!source) {
      this.ensureSources();
      return;
    }
    if (!this.selectedId) {
      source.setData({ type: "FeatureCollection", features: [] } as any);
      return;
    }
    const tle = this.tleById.get(this.selectedId);
    if (!tle) return;
    const coords = groundTrackFromTLE(tle, 90, 30, new Date());
    const fc = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: { id: "___sel___" },
        },
      ],
    } as const;
    source.setData(fc as any);
  }

  private highlightSelected() {
    this.map.setFilter("sats-selected", [
      "==",
      ["get", "id"],
      this.selectedId ?? "___none___",
    ]);
  }
}
