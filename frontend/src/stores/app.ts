import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    selectedId: null as string | null,
    watchlistOpen: false,
    sidebarOpen: false,
  }),
  actions: {
    select(id: string | null) {
      this.selectedId = id;
      this.sidebarOpen = !!id;
    }
  }
});
