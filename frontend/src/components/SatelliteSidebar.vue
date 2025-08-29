<template>
  <aside v-if="open" class="sidebar">
    <header>
      <div>
        <div class="title">{{ sat?.name || '—' }}</div>
        <div class="muted">NORAD: {{ id }}</div>
      </div>
      <button @click="$emit('close')">×</button>
    </header>
    <section v-if="sat">
      <div class="group">
        <div class="label">Последнее обновление TLE</div>
        <div>{{ new Date(sat.updatedAt).toLocaleString() }}</div>
      </div>
      <div class="group">
        <div class="label">Управление</div>
        <div class="row">
          <button v-if="!tracked" @click="track()">🎯 Добавить в отслеживаемые</button>
          <button v-else @click="untrack()">🎯 Удалить из отслеживаемых</button>
        </div>
      </div>
      <details>
        <summary>TLE</summary>
        <pre>{{ sat.line1 }}\n{{ sat.line2 }}</pre>
      </details>
    </section>
  </aside>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { api } from '../api/client';
import type { TLE } from '../lib/types';

const props = defineProps<{ id: string | null, open: boolean }>();
const emit = defineEmits<{ (e:'close'): void }>();

const sat = ref<TLE | null>(null);
const tracked = ref(false);

async function refresh() {
  if (!props.id) { sat.value = null; return; }
  const { data } = await api.get(`/satellites/${props.id}`);
  sat.value = data;
  const { data: wl } = await api.get('/watchlist');
  tracked.value = (wl.items || []).includes(props.id);
}

async function track() {
  if (!props.id) return;
  await api.post('/watchlist', { id: props.id });
  await refresh();
}
async function untrack() {
  if (!props.id) return;
  if (!confirm('Вы точно хотите удалить спутник из отслеживаемых?')) return;
  await api.delete(`/watchlist/${props.id}`);
  await refresh();
}

onMounted(refresh);
watch(() => props.id, refresh);
</script>
<style scoped>
.sidebar { position: absolute; left: 0; top: 48px; bottom: 0; width: 340px; background: #0b1020; color: #e5e7eb; border-right:1px solid #334155; display:flex; flex-direction:column; }
header { display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #334155; }
.title { font-weight:600; }
.muted { color:#94a3b8; font-size:12px; }
section { padding: 10px; display:flex; flex-direction:column; gap:12px; }
.group { background:#111827; padding:8px 10px; border-radius:8px; }
.label { color:#94a3b8; font-size:12px; margin-bottom:4px; }
.row { display:flex; gap:8px; }
pre { white-space: pre-wrap; background:#0b1020; border:1px solid #334155; padding:8px; border-radius:8px; }
</style>
