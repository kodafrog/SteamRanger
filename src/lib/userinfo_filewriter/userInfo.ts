import { exists, readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { join, homeDir } from "@tauri-apps/api/path";

const KEY_FILENAME = "api_key.txt";

async function getKeyPath(): Promise<string> {
  const home = await homeDir();
  const dir = await join(home, "SteamRanger", "userinfo");
  await mkdir(dir, { recursive: true });
  return await join(dir, KEY_FILENAME);
}

/**
 * Returns the saved API key, or null if no key has been saved.
 */
export async function loadSavedApiKey(): Promise<string | null> {
  try {
    const path = await getKeyPath();
    const keyExists = await exists(path);
    if (!keyExists) return null;
    const key = await readTextFile(path);
    return key.trim() || null;
  } catch {
    return null;
  }
} //tet 

/**
 * Saves the API key to disk.
 */
export async function saveApiKey(key: string): Promise<void> {
  const path = await getKeyPath();
  await writeTextFile(path, key.trim());
}

/**
 * Returns true if a saved API key file exists on disk.
 */
export async function hasSavedApiKey(): Promise<boolean> {
  try {
    const path = await getKeyPath();
    return await exists(path);
  } catch {
    return false;
  }
}