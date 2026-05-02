import { invoke } from "@tauri-apps/api/core";

/**
 * This module provides functions to interact with the Steam API.
 * NEVER call invoke() directly in components.
 */
export const steamApi = {
  async getAchievements(appid: string, apiKey: string) {
    return await invoke("get_achievements", {
      req: {
        appid,
        api_key: apiKey
      }
    });
  },

  async downloadIcon(url: string, destPath: string): Promise<void> {
    return await invoke("download_icon", { url, destPath });
  }
};