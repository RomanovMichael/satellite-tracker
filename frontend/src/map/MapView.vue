<template>
  <div ref="el" class="map"></div>
  <div v-if="hover" class="hint" :style="hintStyle">{{ hover.name }} ({{ hover.id }})</div>
</template>
<script setup lang="ts">
import maplibregl, { Map, MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { api } from '../api/client';
import type { TLE } from '../lib/types';
import { SatelliteLayer } from './satelliteLayer';

const props = defineProps<{ selectedId: string | null }>();
const emit = defineEmits<{ (e:'click-sat', id: string): void }>();

const el = ref<HTMLDivElement | null>(null);
let map: Map | null = null;
let layer: SatelliteLayer | null = null;
const hover = ref<{ id: string, name: string } | null>(null);
const hintPos = ref<[number, number] | null>(null);

const hintStyle = computed(() => ({
  left: hintPos.value ? `${hintPos.value[0] + 10}px` : '-9999px',
  top: hintPos.value ? `${hintPos.value[1] + 10}px` : '-9999px'
}));

let raf = 0;

async function loadInitial() {
  const first = await api.get('/satellites', { params: { pageSize: 600 } });
  const items: { noradId: string, name: string }[] = first.data.items;

  const tles: TLE[] = [];
  for (const it of items) {
    const { data } = await api.get(`/satellites/${it.noradId}`);
    tles.push(data);
  }
  layer?.setData(tles);
}

function animate() {
  layer?.tick();
  raf = requestAnimationFrame(animate);
}

onMounted(async () => {
  map = new Map({
    container: el.value!,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 20],
    zoom: 1.5,
    attributionControl: false
  });
  layer = new SatelliteLayer(map);

  map.on('load', async () => {
    try { await loadInitial(); } catch (e) { console.error('loadInitial failed', e); }
    animate();
  });

  map.on('mousemove', 'sats', (e: MapMouseEvent) => {
    const f = e.features?.[0];
    if (!f) { hover.value = null; return; }
    hover.value = { id: String(f.properties?.id), name: String(f.properties?.name) };
    hintPos.value = [e.point.x, e.point.y];
  });
  map.on('mouseleave', 'sats', () => { hover.value = null; });
  map.on('click', 'sats', (e: MapMouseEvent) => {
    const f = e.features?.[0];
    if (!f) return;
    const id = String(f.properties?.id);
    emit('click-sat', id);
  });
});

onUnmounted(() => { if (raf) cancelAnimationFrame(raf); map?.remove(); });

watch(() => props.selectedId, (id) => layer?.select(id ?? null));

function flyTo(id: string) {
  const src: any = map?.getSource('sats');
  if (!src) return;
  const fc = src._data as GeoJSON.FeatureCollection;
  const f = fc.features.find((ft: any) => ft.properties.id === id) as any;
  if (f) map?.flyTo({ center: f.geometry.coordinates, zoom: 4 });
}
defineExpose({ flyTo });
</script>
<style scoped>
.map { position: absolute; inset: 48px 0 0 0; }
.hint { position: absolute; padding: 4px 6px; background: #0b1020; color: #e5e7eb; border: 1px solid #334155; border-radius: 6px; pointer-events: none; font-size: 12px; }
</style>
