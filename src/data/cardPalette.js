// Fixed (theme-independent) icon-badge colors cycled across the 8 home
// cards, purely for visual variety — like a dashboard's mixed-color stat
// tiles. Deliberately not theme-derived; a handful of soft, vivid pairs
// reads fine on both light and dark card surfaces.
export const CARD_ICON_PALETTE = [
  { bg: '#FDECD8', fg: '#DB8A2E' }, // amber
  { bg: '#E8E3FB', fg: '#7C5CE0' }, // violet
  { bg: '#DCEEFB', fg: '#2E86C1' }, // blue
  { bg: '#E0F5E9', fg: '#2E9E5B' }, // green
  { bg: '#FCE4E4', fg: '#D9534F' }, // red
  { bg: '#FDF1D0', fg: '#C99A1E' }, // gold
  { bg: '#E2F6F4', fg: '#1E9C90' }, // teal
  { bg: '#F3E2F5', fg: '#A64CB0' }, // magenta
];

export function paletteAt(index) {
  return CARD_ICON_PALETTE[index % CARD_ICON_PALETTE.length];
}
