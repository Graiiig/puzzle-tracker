import type { Dict } from '../i18n';
import type { AchievementId, Tier } from './achievements';

export function achievementTitle(t: Dict, id: AchievementId): string {
  switch (id) {
    case 'collector':
      return t.achievements.collectorTitle;
    case 'marathon':
      return t.achievements.marathonTitle;
    case 'dedicated':
      return t.achievements.dedicatedTitle;
    case 'superfan':
      return t.achievements.superfanTitle;
    case 'eclectic':
      return t.achievements.eclecticTitle;
    case 'demanding':
      return t.achievements.demandingTitle;
  }
}

export function tierLabel(t: Dict, tier: Tier): string {
  switch (tier) {
    case 'bronze':
      return t.achievements.tierBronze;
    case 'silver':
      return t.achievements.tierSilver;
    case 'gold':
      return t.achievements.tierGold;
    case 'platinum':
      return t.achievements.tierPlatinum;
  }
}
