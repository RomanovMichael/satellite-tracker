<template>
  <HeaderBar @found="onFound" @open-watchlist="openWatchlist = true" />
  <MapView ref="map" :selected-id="selectedId" @click-sat="openSidebar" />
  <SatelliteSidebar :id="selectedId" :open="sidebarOpen" @close="sidebarOpen=false" />
  <WatchlistModal :open="openWatchlist" @close="openWatchlist=false" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import HeaderBar from './components/HeaderBar.vue';
import MapView from './map/MapView.vue';
import SatelliteSidebar from './components/SatelliteSidebar.vue';
import WatchlistModal from './components/WatchlistModal.vue';

const selectedId = ref<string|null>(null);
const sidebarOpen = ref(false);
const openWatchlist = ref(false);
const map = ref<InstanceType<typeof MapView> | null>(null);

function openSidebar(id: string) {
  selectedId.value = id;
  sidebarOpen.value = true;
}

function onFound(payload: { noradId: string }) {
  selectedId.value = payload.noradId;
  sidebarOpen.value = true;
  map.value?.flyTo(payload.noradId);
}
</script>
