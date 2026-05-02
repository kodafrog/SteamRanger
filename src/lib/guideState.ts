import { ref } from "vue";
import type { GuideAchievement, AchievementGroup } from "./achievement";

export const achievements = ref<GuideAchievement[]>([]);
export const groups = ref<AchievementGroup[]>([]);

export const unsorted = ref<GuideAchievement[]>([]);
export const showUnsorted = ref(false);

/**
 * Set when the user clicks Continue from GroupsManager.
 * Carries the final group+achievement data into the export phase.
 */
export const showExport = ref(false);
export const exportGroups = ref<AchievementGroup[]>([]);

/**
 * Search query from GroupsManager, consumed by Unsorted to highlight matches.
 */
export const searchQuery = ref<string>("");

/**
 * The currently starred group ID from GroupsManager.
 * Used by Unsorted to send achievements on double-click.
 */
export const defaultGroupId = ref<string | null>(null);

/**
 * Game name extracted from the Steam store URL slug.
 * e.g. "Portal" from https://store.steampowered.com/app/400/Portal/
 */
export const gameName = ref<string>("");