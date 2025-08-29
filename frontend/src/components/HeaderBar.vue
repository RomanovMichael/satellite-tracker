<template>
  <header class="bar">
    <div class="left">
      <strong>Starlink Tracker</strong>
    </div>
    <div class="center">
      <input v-model.trim="q" @input="onInput" placeholder="Поиск: имя или NORAD" />
      <div v-if="showResults" class="results">
        <div v-if="loading" class="item">Загрузка...</div>
        <div v-else-if="items.length === 0" class="item muted">Нет данных</div>
        <button v-for="it in items" :key="it.noradId" class="item" @click="select(it)">
          {{ it.name }} ({{ it.noradId }})
        </button>
      </div>
    </div>
    <div class="right">
      <button @click="$emit('open-watchlist')">Отслеживаемые</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../api/client';

const emit = defineEmits<{ (e:'found', payload:{ noradId:string, name:string }): void; (e:'open-watchlist'): void }>();
const q = ref('');
const items = ref<{ noradId: string; name: string }[]>([]);
const loading = ref(false);
const showResults = ref(false);
let debounce: number | null = null;

function onInput() {
  showResults.value = true;
  if (debounce) window.clearTimeout(debounce);
  debounce = window.setTimeout(async () => {
    if (!q.value) { items.value = []; return; }
    loading.value = true;
    const { data } = await api.get('/satellites', { params: { q: q.value, pageSize: 20 } });
    items.value = data.items;
    loading.value = false;
  }, 250);
}

function select(it: { noradId: string; name: string }) {
  showResults.value = false;
  emit('found', { noradId: it.noradId, name: it.name });
}
</script>

<style scoped>
.bar { display: flex; align-items: center; padding: 8px 12px; gap: 12px; background: #0f172a; color: #fff; }
.left { font-size: 14px; }
.center { position: relative; flex: 1; }
input { width: 100%; padding: 8px 10px; border-radius: 8px; border: 1px solid #334155; background: #111827; color: #e5e7eb; }
.results { position: absolute; top: 110%; left: 0; right: 0; background: #0b1020; border: 1px solid #334155; border-radius: 8px; max-height: 320px; overflow: auto; }
.item { width: 100%; text-align: left; padding: 8px 10px; border: none; background: transparent; color: #e5e7eb; cursor: pointer; }
.item:hover { background: #111827; }
.item.muted { color: #94a3b8; cursor: default; }
.right button { background: #1f2937; color: #e5e7eb; border: 1px solid #334155; padding: 6px 10px; border-radius: 8px; }
.right button:hover { background: #111827; }
</style>
