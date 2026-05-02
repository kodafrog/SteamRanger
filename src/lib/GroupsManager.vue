<template>
  <div class="groups">

    <h2 class="heading">Achievement Groups</h2>

    <input
      v-model="searchQuery"
      class="input input-search"
      placeholder="Achievement Name"
    />

    <div class="create-row">
      <input
        v-model="newGroupName"
        class="input"
        placeholder="e.g. Missable, Story..."
        @keydown.enter="createGroup"
      />
      <button class="btn" @click="createGroup">Add Group</button>
    </div>

    <div v-for="group in groups" :key="group.id" class="group-card" :class="{ 'is-default': defaultGroupId === group.id }">

      <div class="group-header">
        <span class="group-title">{{ group.name }}</span>
        <div class="group-actions">
          <button
            class="btn btn-default-toggle"
            :class="{ active: defaultGroupId === group.id }"
            @click="toggleDefault(group.id)"
            :title="defaultGroupId === group.id ? 'Remove as default' : 'Set as default dump group'"
          >
            {{ defaultGroupId === group.id ? "★" : "☆" }}
          </button>
          <button class="btn btn-danger" @click="removeGroup(group.id)">Remove</button>
        </div>
      </div>

      <Draggable
        v-model="group.achievements"
        item-key="id"
        class="drop-zone"
        :group="{ name: 'achievements', pull: true, put: true }"
        :animation="150"
        @add="onAdd($event, group.id)"
      >
        <template #item="{ element }">
          <div class="ach-item" :title="element.name">
            <img :src="element.icon" />
          </div>
        </template>
      </Draggable>

      <p class="meta">{{ group.achievements.length }} achievements</p>

    </div>

    <div class="continue-row">
      <div class="continue-left">
        <button
          v-if="defaultGroupId && unsorted.length > 0"
          class="btn btn-dump"
          @click="dumpToDefault"
        >
          Dump {{ unsorted.length }} remaining → {{ defaultGroupName }}
        </button>
      </div>
      <div class="continue-right">
        <span class="continue-hint" v-if="unsorted.length > 0">
          {{ unsorted.length }} achievement{{ unsorted.length === 1 ? "" : "s" }} still unsorted
        </span>
        <button
          class="btn btn-continue"
          :disabled="unsorted.length > 0"
          @click="handleContinue"
        >
          Continue →
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from "vue";
import Draggable from "vuedraggable";

import { unsorted, showExport, exportGroups, groups, searchQuery, defaultGroupId } from "../lib/GuideState";
import type { GuideAchievement, AchievementGroup } from "../lib/achievement";

const emit = defineEmits<{
  (e: "update:groups", groups: AchievementGroup[]): void;
}>();

const newGroupName = ref("");

const defaultGroupName = computed(() =>
  groups.value.find(g => g.id === defaultGroupId.value)?.name ?? ""
);

onUnmounted(() => { searchQuery.value = ""; });

function toggleDefault(id: string) {
  defaultGroupId.value = defaultGroupId.value === id ? null : id;
}

function createGroup() {
  const name = newGroupName.value.trim();
  if (!name) return;

  groups.value.push({
    id: crypto.randomUUID(),
    name,
    achievements: []
  });

  newGroupName.value = "";
}

function removeGroup(id: string) {
  const group = groups.value.find(g => g.id === id);

  if (group && group.achievements.length > 0) {
    const returned = group.achievements.map(a => ({ ...a, groupId: null }));
    unsorted.value = [...unsorted.value, ...returned];
  }

  if (defaultGroupId.value === id) defaultGroupId.value = null;

  groups.value = groups.value.filter(g => g.id !== id);
}

function dumpToDefault() {
  if (!defaultGroupId.value || unsorted.value.length === 0) return;

  const target = groups.value.find(g => g.id === defaultGroupId.value);
  if (!target) return;

  const dumped = unsorted.value.map(a => ({ ...a, groupId: defaultGroupId.value }));
  target.achievements = [...target.achievements, ...dumped];
  unsorted.value = [];
}

function onAdd(evt: any, groupId: string) {
  const item: GuideAchievement = evt.item.__draggable_context.element;
  item.groupId = groupId;
  unsorted.value = unsorted.value.filter(a => a.id !== item.id);
}

function handleContinue() {
  if (unsorted.value.length > 0) return;
  exportGroups.value = groups.value;
  showExport.value = true;
}

watch(
  groups,
  (val) => emit("update:groups", val),
  { deep: true }
);
</script>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.heading {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
}

.input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.input-search {
  font-size: 12px;
  padding: 7px 10px;
  flex: unset;
  width: 100%;
  box-sizing: border-box;
}

.create-row {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: #111827;
  color: white;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover {
  background: #1f2937;
}

.btn-danger {
  background: #dc2626;
  padding: 4px 10px;
  font-size: 12px;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-default-toggle {
  background: transparent;
  color: #9ca3af;
  padding: 2px 6px;
  font-size: 16px;
  border: none;
  box-shadow: none;
}

.btn-default-toggle:hover {
  background: transparent;
  color: #f59e0b;
}

.btn-default-toggle.active {
  background: transparent;
  color: #f59e0b;
}

.btn-default-toggle.active:hover {
  background: transparent;
  color: #d97706;
}

.btn-dump {
  background: #2563eb;
  font-size: 12px;
  padding: 8px 12px;
}

.btn-dump:hover {
  background: #1d4ed8;
}

.btn-continue:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.group-card {
  border: 1px solid #d1d5db;
  padding: 10px;
  border-radius: 6px;
  background: #fff;
}

.group-card.is-default {
  border-color: #16a34a;
  background: #f0fdf4;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.group-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.drop-zone {
  min-height: 60px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  background: #f9fafb;
}

.ach-item {
  width: 40px;
  height: 40px;
  cursor: grab;
}

.ach-item img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.meta {
  font-size: 12px;
  color: #6b7280;
  margin: 6px 0 0;
}

.continue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.continue-left {
  flex: 1;
}

.continue-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.continue-hint {
  font-size: 12px;
  color: #6b7280;
}
</style>