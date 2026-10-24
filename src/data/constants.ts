import { ScoreOption, UserProfile } from '../types';

export const TRIGGER_OPTIONS = [
  'STRESSED',
  'LONELINESS',
  'ANGER',
  'ANXIETY / FEAR',
  'DEPRESSION / SADNESS',
  'BOREDOM',
  'SHAME / GUILT',
  'REJECTION OR PERCEIVED REJECTION',
  'RELATIONSHIP CONFLICT',
  'FATIGUE',
  'BEING ALONE',
  'ENVIRONMENTAL CUES',
  'ALCOHOL OR OTHER SUBSTANCES',
  'SUCCESS / EXCITEMENT',
  'SEXUAL AROUSAL',
  'MEMORIES / TRAUMA REMINDERS',
  'OPPORTUNITY AND SECRECY',
] as const;

export const SCORE_OPTIONS: ScoreOption[] = [
  {
    level: 1,
    code: '1 - SEE',
    title: '1 - SEE',
    description: 'Saw her and then looked away immediately',
    icon: 'Eye',
  },
  {
    level: 2,
    code: '2 - LOOK',
    title: '2 - LOOK',
    description: 'A second look that took conscious effort to redirect',
    icon: 'EyeOff',
  },
  {
    level: 3,
    code: '3 - PROLONGED LOOK',
    title: '3 - PROLONGED LOOK',
    description: 'Prolonged look or lingering gaze (> 2-3 seconds)',
    icon: 'Clock',
  },
  {
    level: 4,
    code: '4 - LOOK WITH LONGING',
    title: '4 - LOOK WITH LONGING',
    description: 'Sustained lustful gaze, fantasy, or emotional craving',
    icon: 'Heart',
  },
];

export const FEELING_OPTIONS = [
  { id: 'neutral', label: 'NEUTRAL', icon: 'Smile' },
  { id: 'hungry', label: 'HUNGRY', icon: 'Utensils' },
  { id: 'angry', label: 'ANGRY', icon: 'Flame' },
  { id: 'lonely', label: 'LONELY', icon: 'UserX' },
  { id: 'tired', label: 'TIRED', icon: 'Moon' },
  { id: 'stressed', label: 'STRESSED', icon: 'Zap' },
  { id: 'bored', label: 'BORED', icon: 'Coffee' },
  { id: 'other', label: 'OTHER', icon: 'HelpCircle' },
];

export const LOCATION_OPTIONS = [
  { id: 'home', label: 'HOME', icon: 'Home' },
  { id: 'work', label: 'WORK', icon: 'Briefcase' },
  { id: 'driving', label: 'DRIVING', icon: 'Car' },
  { id: 'shopping', label: 'SHOPPING', icon: 'ShoppingBag' },
  { id: 'church', label: 'CHURCH', icon: 'Church' },
  { id: 'on_phone', label: 'ON PHONE', icon: 'Smartphone' },
  { id: 'on_tv', label: 'ON TV', icon: 'Tv' },
  { id: 'on_computer', label: 'ON COMPUTER', icon: 'Monitor' },
  { id: 'other', label: 'OTHER', icon: 'Compass' },
];

export const ATTIRE_OPTIONS = [
  { id: 'yoga_pants', label: 'YOGA PANTS', icon: 'Layers' },
  { id: 'revealing_top', label: 'REVEALING TOP', icon: 'Shirt' },
  { id: 'tight_shorts', label: 'TIGHT SHORTS', icon: 'Scissors' },
  { id: 'tight_jeans', label: 'TIGHT JEANS', icon: 'Activity' },
  { id: 'swim_suit', label: 'SWIM SUIT', icon: 'Waves' },
  { id: 'nudity', label: 'NUDITY', icon: 'ShieldAlert' },
  { id: 'full_frontal', label: 'FULL FRONTAL NUDITY', icon: 'AlertTriangle' },
  { id: 'other', label: 'OTHER', icon: 'MoreHorizontal' },
];

export const EYES_OPTIONS = [
  { id: 'breasts', label: 'BREASTS', icon: 'CircleDot' },
  { id: 'butt', label: 'BUTT', icon: 'HeartHandshake' },
  { id: 'legs', label: 'LEGS', icon: 'MoveDown' },
  { id: 'pelvic_region', label: 'PELVIC REGION', icon: 'Shield' },
  { id: 'whole_package', label: 'THE WHOLE PACKAGE', icon: 'Sparkles' },
  { id: 'other', label: 'OTHER', icon: 'Eye' },
];

export const BUILD_OPTIONS = [
  { id: 'athletic', label: 'ATHLETIC', icon: 'Dumbbell' },
  { id: 'curvy', label: 'CURVY', icon: 'TrendingUp' },
  { id: 'thin', label: 'THIN', icon: 'Minus' },
  { id: 'tall', label: 'TALL', icon: 'ArrowUp' },
  { id: 'short', label: 'SHORT', icon: 'ArrowDown' },
  { id: 'long_legs', label: 'LONG LEGS', icon: 'ChevronUp' },
  { id: 'big_breasts', label: 'BIG BREASTS', icon: 'Circle' },
  { id: 'shapely_butt', label: 'SHAPELY BUTT', icon: 'Award' },
  { id: 'other', label: 'OTHER', icon: 'User' },
];

export const HAIR_OPTIONS = [
  { id: 'blonde', label: 'BLONDE', color: '#F1CA63', bgClass: 'bg-[#F1CA63]' },
  { id: 'brown_auburn', label: 'BROWN / AUBURN', color: '#8D5B28', bgClass: 'bg-[#8D5B28]' },
  { id: 'black', label: 'BLACK', color: '#181818', bgClass: 'bg-[#181818]' },
  { id: 'red', label: 'RED', color: '#C83226', bgClass: 'bg-[#C83226]' },
  { id: 'gray_white', label: 'GRAY / WHITE', color: '#D8D8D8', bgClass: 'bg-[#D8D8D8]' },
  { id: 'other', label: 'OTHER', color: '#765B24', bgClass: 'bg-[#765B24]' },
];

export const INITIAL_USER: UserProfile = {
  name: '',
  phone: '',
  email: '',
  accountabilityEmail: '',
  isRegistered: false,
  joinedDate: '',
};
