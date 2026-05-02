<template>
  <div v-if="showUnsorted" class="unsorted-container">

    <div class="grid-wrapper" @click="onGridClick">
    <Draggable
      v-model="unsorted"
      item-key="id"
      class="grid"
      :animation="150"
      ghost-class="ghost"
      :group="{ name: 'achievements', pull: true, put: true }"
    >
      <template #item="{ element }">
        <div
          class="icon-wrapper"
          :class="{
            dimmed: !isMatch(element.id),
            spotlight: element.id === spotlightId,
            'has-default': !!defaultGroupId && shiftHeld
          }"
          :title="defaultGroupId ? `${element.name}` : element.name"
          :data-id="element.id"
        >
          <img :src="element.icon" class="icon" />
        </div>
      </template>
    </Draggable>
    </div>

    <div class="footer">
      <button class="reset" @click="reset">Reset</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import Draggable from "vuedraggable";
import { computed, ref, onMounted, onUnmounted } from "vue";

import {
  unsorted,
  showUnsorted,
  showExport,
  achievements,
  groups,
  exportGroups,
  gameName,
  searchQuery,
  defaultGroupId
} from "../lib/GuideState";

const shiftHeld = ref(false);

onMounted(() => {
  window.addEventListener("keydown", e => { if (e.key === "Shift") shiftHeld.value = true; });
  window.addEventListener("keyup", e => { if (e.key === "Shift") shiftHeld.value = false; });
});

onUnmounted(() => {
  window.removeEventListener("keydown", e => { if (e.key === "Shift") shiftHeld.value = true; });
  window.removeEventListener("keyup", e => { if (e.key === "Shift") shiftHeld.value = false; });
});
// Listening on the grid rather than on individual items avoids any
// conflict with SortableJS's mousedown handling on draggable elements.

function onGridClick(e: MouseEvent) {
  if (!e.shiftKey || !defaultGroupId.value) return;
  const wrapper = (e.target as HTMLElement).closest('[data-id]') as HTMLElement | null;
  if (!wrapper) return;
  const id = wrapper.dataset.id;
  if (id) sendToDefault(id);
}

function sendToDefault(id: string) {
  if (!defaultGroupId.value) return;
  const target = groups.value.find(g => g.id === defaultGroupId.value);
  if (!target) return;

  const ach = unsorted.value.find(a => a.id === id);
  if (!ach) return;

  ach.groupId = defaultGroupId.value;
  target.achievements.push({ ...ach });
  unsorted.value = unsorted.value.filter(a => a.id !== id);
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function reset() {
  unsorted.value = [];
  achievements.value = [];
  groups.value = [];
  exportGroups.value = [];
  gameName.value = "";
  defaultGroupId.value = null;
  showExport.value = false;
  showUnsorted.value = false;
}

// ─── Search / spotlight ───────────────────────────────────────────────────────

const matchSet = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return null;
  return new Set(
    unsorted.value
      .filter(a => a.name.toLowerCase().includes(q))
      .map(a => a.id)
  );
});

const spotlightId = computed(() => {
  if (!matchSet.value || matchSet.value.size !== 1) return null;
  return [...matchSet.value][0];
});

function isMatch(id: string): boolean {
  if (!matchSet.value) return true;
  return matchSet.value.has(id);
}
</script>

<style scoped>
.unsorted-container {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.grid-wrapper {
  flex: 1;
  display: flex;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  align-content: flex-start;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  cursor: grab;
}

.icon-wrapper.has-default {
  cursor: copy;
}

.icon-wrapper.has-default:hover {
  outline: 2px solid #111827;
  border-radius: 5px;
}

.icon {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.ghost {
  opacity: 0.4;
}

.dimmed {
  opacity: 0.15;
  transition: opacity 0.15s;
}

.spotlight {
  animation: wiggle 0.75s ease-in-out infinite;
}

@keyframes wiggle {
  0%   { transform: rotate(0deg); }
  10%  { transform: rotate(-12deg); }
  20%  { transform: rotate(12deg); }
  30%  { transform: rotate(-8deg); }
  40%  { transform: rotate(8deg); }
  50%  { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.footer {
  margin-top: auto;
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

.reset {
  font-size: 12px;
}
</style>