<template>
  <div v-if="open" class="overlay" @click.self="close">
    <div class="modal">
      <header>
        <strong>Отслеживаемые</strong>
        <button @click="close">×</button>
      </header>
      <section>
        <div v-if="loading">Загрузка...</div>
        <div v-else-if="items.length === 0" class="muted">Пусто</div>
        <ul>
          <li v-for="id in items" :key="id">
            <span>{{ id }}</span>
            <button @click="remove(id)">Удалить</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { api } from '../api/client';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e:'close'): void, (e:'focus', id: string): void }>();

const items = ref<string[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  const { data } = await api.get('/watchlist');
  items.value = data.items || [];
  loading.value = false;
}

function close() { emit('close'); }

async function remove(id: string) {
  if (!confirm('Удалить из отслеживаемых?')) return;
  await api.delete(`/watchlist/${id}`);
  await load();
}

onMounted(load);
watch(() => props.open, (v) => v && load());
</script>
<style scoped>
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; }
.modal { width: 480px; max-width: 94vw; background:#0b1020; border:1px solid #334155; border-radius:12px; color:#e5e7eb; }
header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid #334155; }
section { padding: 10px 12px; }
ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
li { display:flex; align-items:center; justify-content:space-between; background:#111827; padding:8px 10px; border-radius:8px; }
.muted { color:#94a3b8; }
</style>
