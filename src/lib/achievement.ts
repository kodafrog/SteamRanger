export interface SteamAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  hidden: boolean;
}

export interface SteamGameAchievements {
  appid: string;
  achievements: SteamAchievement[];
}

export interface GuideAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;

  groupId: string | null;
  sourceAppId: string;
}

export interface AchievementGroup {
  id: string;
  name: string;
  color?: string;

  /**
   * ORDER MATTERS
   */
  achievements: GuideAchievement[];
}