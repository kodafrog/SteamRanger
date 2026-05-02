import type { SteamGameAchievements, GuideAchievement } from "../lib/achievement";

export function normalizeSteamAchievements(
  data: SteamGameAchievements
): GuideAchievement[] {
  return data.achievements.map((a) => ({
    id: `${data.appid}-${a.id}`,
    name: a.name,
    description: a.description,
    icon: a.icon,
    groupId: null,
    sourceAppId: data.appid
  }));
}