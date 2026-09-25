// Config for the 8-card grid on the Home screen (4 left, 4 right).
//
// `action` controls what tapping the card does — see HomeStack:
//   'alphabet'   -> opens the Telugu-alphabet placeholder screen
//   'bible'      -> opens the (sample-data) Bible reader screen
//   'comingSoon' -> opens a generic "working on it" screen
//   'notes'      -> opens the Announcements/Notes screen
//
// These are placeholder titles — rename anything below, it's just data.

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
    id: 'kids-songs',
    title: 'ప్రత్యేక కీర్తనలు',
    subtitle: "Kids' Songs",
    icon: 'happy-outline',
    action: 'alphabet',
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
    id: 'daily-promise',
    title: 'Daily Promise',
    subtitle: 'నేటి వాగ్దానం',
    icon: 'sparkles-outline',
    action: 'comingSoon',
  },
  {
    id: 'daily-message',
    title: 'Daily Message',
    subtitle: 'నేటి సందేశం',
    icon: 'chatbubble-ellipses-outline',
    action: 'comingSoon',
  },
  {
    id: 'announcements',
    title: 'ప్రకటనలు',
    subtitle: 'Announcements & Notes',
    icon: 'document-text-outline',
    action: 'notes',
  },
];
