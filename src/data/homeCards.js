// Config for the 12-card grid on the Home screen (6 left, 6 right).
//
// `action` controls what tapping the card does — see HomeStack:
//   'alphabet'   -> opens the Telugu-alphabet placeholder screen
//   'bible'      -> opens the real Telugu Bible reader
//   'comingSoon' -> opens a generic "working on it" screen
//   'notes'      -> opens the personal Notes screen
//
// L1-L3 and R1 are the original 4 cards, kept exactly as they were
// (same id/title/icon/action) — everything else here is new, per the
// updated card-layout sketch, and opens the "working on it" placeholder
// until each feature is actually built.

export const leftCards = [
  {
    id: 'telugu-hymns',
    title: 'తెలుగు క్రైస్తవ కీర్తనలు.',
    subtitle: 'Telugu Hymns',
    icon: 'musical-notes-outline',
    action: 'alphabet',
  },
  {
    id: 'worship-songs',
    title: 'క్రైస్తవ సునాద కీర్తనలు',
    subtitle: 'Worship Songs',
    icon: 'flame-outline',
    action: 'alphabet',
  },
  {
    id: 'prayer-songs',
    title: 'సండే స్కూల్ కీర్తనలు',
    subtitle: 'Prayer Songs',
    icon: 'hand-left-outline',
    action: 'alphabet',
  },
  {
    id: 'brethren-movement',
    title: 'బ్రదరన్ మూవ్‌మెంట్',
    subtitle: 'Brethren Movement',
    icon: 'people-outline',
    action: 'comingSoon',
  },
  {
    id: 'live-links',
    title: 'లైవ్ లింక్స్',
    subtitle: 'Live Links',
    icon: 'videocam-outline',
    action: 'comingSoon',
  },
  {
    id: 'announcements-feed',
    title: 'ప్రకటనలు',
    subtitle: 'Announcements',
    icon: 'megaphone-outline',
    action: 'comingSoon',
  },
];

export const rightCards = [
  {
    id: 'bible',
    title: 'బైబిల్',
    subtitle: 'Telugu Bible',
    icon: 'book-outline',
    action: 'bible',
  },
  {
    id: 'sunday-school-lessons',
    title: 'సండే స్కూల్ పాఠములు',
    subtitle: 'Sunday School Lessons',
    icon: 'school-outline',
    action: 'comingSoon',
  },
  {
    id: 'sermons-notes',
    title: 'ప్రసంగ నోట్స్',
    subtitle: 'Sermons & Notes',
    icon: 'mic-outline',
    action: 'comingSoon',
  },
  {
    id: 'missionary-stories',
    title: 'మిషనరీ కథలు',
    subtitle: 'Missionary Stories',
    icon: 'globe-outline',
    action: 'comingSoon',
  },
  {
    id: 'music-tracks',
    title: 'మ్యూజిక్ ట్రాక్స్',
    subtitle: 'Music Tracks',
    icon: 'headset-outline',
    action: 'comingSoon',
  },
  {
    id: 'notes',
    title: 'నా నోట్స్',
    subtitle: 'Notes',
    icon: 'document-text-outline',
    action: 'notes',
  },
];
