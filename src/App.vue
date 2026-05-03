<template>
  <div class="app">

    <!-- SEARCH PHASE -->
    <div v-if="!showUnsorted" class="search-phase">
      <SearchBar @success="handleFetch" />
    </div>

    <!-- WORKSPACE PHASE -->
    <div v-else-if="!showExport" class="workspace">

      <!-- TOP BAR -->
      <div class="top-bar">
        <h2 class="title">{{ currentGameTitle || "Steam Achievement Builder" }}</h2>
      </div>

      <!-- MAIN LAYOUT -->
      <div class="layout">

        <!-- LEFT: UNSORTED POOL -->
        <div class="panel unsorted">
          <Unsorted />
        </div>

        <!-- RIGHT: GROUPS -->
        <div class="panel groups">
          <GroupsManager />
        </div>

      </div>

    </div>

    <!-- EXPORT PHASE -->
    <div v-else class="workspace">
      <div class="top-bar">
        <h2 class="title">{{ currentGameTitle || "Steam Achievement Builder" }}</h2>
      </div>
      <div class="layout">
        <div class="panel export-panel">
          <Exportable />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";
import SearchBar from "./lib/searchBar.vue";
import Unsorted from "./lib/Unsorted.vue";
import GroupsManager from "./lib/GroupsManager.vue";
import Exportable from "./Exportable.vue";

import {
  unsorted,
  showUnsorted,
  showExport,
  groups,
  exportGroups,
  gameName
} from "./lib/GuideState";

import { normalizeSteamAchievements } from "./lib/achievementNormalizer";


const currentGameTitle = ref<string | null>(null);

onMounted(async () => {
  const version = await getVersion();
  const appWindow = getCurrentWindow();
  await appWindow.setTitle(`SteamRanger v${version}`);
  document.title = `SteamRanger v${version}`;
});

function handleFetch(data: any, name: string) {
  const normalized = normalizeSteamAchievements(data);

  // Clear all previous session state before loading new game
  groups.value = [];
  exportGroups.value = [];
  showExport.value = false;

  unsorted.value = normalized;
  showUnsorted.value = true;
  gameName.value = name;
  currentGameTitle.value = name;
}
</script>

<!-- Global styles: no scoped so they cascade into all child components -->
<style>
*,
*::before,
*::after {
  user-select: none;
  -webkit-user-select: none;
}

/* Re-enable selection only where users need to type */
input,
textarea {
  user-select: text;
  -webkit-user-select: text;
}

/* Prevent the browser's native image drag ghost from interfering with SortableJS */
img {
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.search-phase {
  margin: auto;
}

.workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-bar {
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.title {
  font-size: 14px;
  font-weight: 600;
}

.layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel {
  padding: 12px;
  overflow-y: auto;
}

.unsorted {
  flex: 2;
  border-right: 1px solid #e5e7eb;
}

.groups {
  flex: 1;
  background: #fafafa;
}

.export-panel {
  flex: 1;
}
</style>