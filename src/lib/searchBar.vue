<template>
  <div class="searchbar">

    <!-- Floating copy confirmation -->
    <div
      v-if="copyPopup.visible"
      class="copy-popup"
      :style="{ top: copyPopup.y + 'px', left: copyPopup.x + 'px' }"
    >
      Copied to clipboard!
    </div>
    <input
      v-model="steamLink"
      type="text"
      placeholder="Steam store link"
      class="input"
    />

    <!-- API KEY ROW -->
    <div class="api-key-row">
      <input
        v-model="apiKey"
        type="password"
        placeholder="API Key"
        class="input api-key"
        autocomplete="off"
      />

      <!-- ? tooltip — only when field is empty and no saved key -->
      <div v-if="!apiKey && !keyIsSaved" class="tooltip-wrapper">
        <span class="tooltip-icon">?</span>
        <div class="tooltip-box">
          <div class="tooltip-box-inner">
          <p>
            A <strong>Steam Developer API Key</strong> is a unique ID for
            accessing Steam endpoints. It should <strong>never be shared
            publicly</strong>.
          </p>
          <p>
            If you don't have one, you can get one at
            <span
              class="tooltip-copy-link"
              @click="copyApiKeyUrl($event)"
            >steamcommunity.com/dev/apikey</span>
            — use <code>example.com</code> as the domain name.
          </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Save checkbox — only when something is typed and key isn't already saved -->
    <label v-if="apiKey && !keyIsSaved" class="save-row">
      <input type="checkbox" v-model="saveKey" />
      <span>Save API key on this device</span>
    </label>

    <button class="btn" @click="handleSubmit" :disabled="loading">
      {{ loading ? "Loading..." : "Fetch Achievements" }}
    </button>

    <p v-if="error" class="error">{{ error }}</p>

    <!-- UPDATE BANNER — bottom right, only when update is available -->
    <div v-if="updateAvailable" class="update-banner">
      <span>⬆ SteamRanger {{ updateVersion }} is available</span>
      <button class="update-btn" @click="installUpdate" :disabled="updateInstalling">
        {{ updateInstalling ? "Installing..." : "Update now" }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { steamApi } from "../lib/steamApi";
import { loadSavedApiKey, saveApiKey } from "./userinfo_filewriter/userinfo";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const copyPopup = reactive({ visible: false, x: 0, y: 0 });
let popupTimer: ReturnType<typeof setTimeout> | null = null;

async function copyApiKeyUrl(e: MouseEvent) {
  await navigator.clipboard.writeText("https://steamcommunity.com/dev/apikey");
  if (popupTimer) clearTimeout(popupTimer);
  copyPopup.x = e.clientX + 10;
  copyPopup.y = e.clientY - 30;
  copyPopup.visible = true;
  popupTimer = setTimeout(() => { copyPopup.visible = false; }, 2000);
}

const emit = defineEmits<{
  (e: "success", data: any, gameName: string): void;
}>();

const steamLink = ref("");
const apiKey = ref("");
const saveKey = ref(false);
const keyIsSaved = ref(false);

const loading = ref(false);
const error = ref<string | null>(null);

// ─── Updater ──────────────────────────────────────────────────────────────────

const updateAvailable = ref(false);
const updateVersion = ref<string | null>(null);
const updateInstalling = ref(false);
let pendingUpdate: Awaited<ReturnType<typeof check>> | null = null;

async function checkForUpdates() {
  try {
    const update = await check();
    if (update?.available) {
      pendingUpdate = update;
      updateVersion.value = update.version;
      updateAvailable.value = true;
    }
  } catch (e) {
    // Silently ignore — no internet or no release yet
    console.warn("Update check failed:", e);
  }
}

async function installUpdate() {
  if (!pendingUpdate) return;
  updateInstalling.value = true;
  try {
    await pendingUpdate.downloadAndInstall();
    await relaunch();
  } catch (e) {
    console.warn("Update failed:", e);
    updateInstalling.value = false;
  }
}

/**
 * On mount: check for a saved key and auto-populate if found.
 * Also kick off the update check.
 */
onMounted(async () => {
  const saved = await loadSavedApiKey();
  if (saved) {
    apiKey.value = saved;
    keyIsSaved.value = true;
  }

  await checkForUpdates();
});

function extractAppId(url: string): string | null {
  const match = url.match(/\/app\/(\d+)/);
  return match?.[1] ?? null;
}

function extractGameName(url: string, appid: string): string {
  const match = url.match(/\/app\/\d+\/([^/]+)/);
  if (!match) return appid;
  return match[1].replace(/_/g, " ");
}

async function handleSubmit() {
  error.value = null;

  const appid = extractAppId(steamLink.value);

  if (!appid) {
    error.value = "Invalid Steam store link. Could not extract appid.";
    return;
  }

  if (!apiKey.value) {
    error.value = "API key is required.";
    return;
  }

  loading.value = true;

  try {
    // Save key if checkbox was ticked
    if (saveKey.value && !keyIsSaved.value) {
      await saveApiKey(apiKey.value);
      keyIsSaved.value = true;
      saveKey.value = false;
    }

    const result = await steamApi.getAchievements(appid, apiKey.value);
    const name = extractGameName(steamLink.value, appid);
    emit("success", result, name);
  } catch (e: any) {
    error.value = e?.message ?? JSON.stringify(e) ?? "Failed to fetch achievements";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.searchbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 500px;
  position: relative;
}

.input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  width: 100%;
}

.api-key-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-row .input {
  flex: 1;
}

.api-key {
  -webkit-text-security: disc;
  letter-spacing: 3px;
}

.api-key::-ms-reveal,
.api-key::-ms-clear {
  display: none;
}

/* TOOLTIP */
.tooltip-wrapper {
  position: relative;
  flex-shrink: 0;
}

.tooltip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #9ca3af;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  cursor: default;
}

.tooltip-box {
  display: none;
  position: absolute;
  right: 0;
  top: 22px;
  padding-top: 8px;
  width: 260px;
  z-index: 50;
}

.tooltip-box-inner {
  background: #1f2937;
  color: #f9fafb;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}

.tooltip-box p {
  margin: 0 0 8px;
}

.tooltip-box p:last-child {
  margin: 0;
}

.tooltip-box a,
.tooltip-copy-link {
  color: #60a5fa;
  text-decoration: underline;
  pointer-events: all;
  cursor: pointer;
}

.copy-popup {
  position: fixed;
  background: #16a34a;
  color: white;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 200;
  animation: fadeout 2s ease forwards;
}

@keyframes fadeout {
  0%   { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}

.tooltip-box code {
  background: #374151;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.tooltip-wrapper:hover .tooltip-box {
  display: block;
}

/* SAVE CHECKBOX */
.save-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.save-row input[type="checkbox"] {
  cursor: pointer;
}

/* BUTTON */
.btn {
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: #111827;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.btn:hover {
  background: #1f2937;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-size: 13px;
}

/* UPDATE BANNER */
.update-banner {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: #111827;
  color: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 100;
}

.update-btn {
  padding: 5px 12px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.update-btn:hover {
  background: #1d4ed8;
}

.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
