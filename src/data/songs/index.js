// Thin loader over the JSON files generate-songs.js produces from the
// .docx files in assets/inputs/. Metro needs static import paths (no
// dynamic require by variable name), so this file is the one place that
// knows about all 4 categories — screens just call the functions below.
import teluguHymns from './telugu-hymns.json';
import worshipSongs from './worship-songs.json';
import prayerSongs from './prayer-songs.json';
import kidsSongs from './kids-songs.json';
import letterIndex from './index.json';

const BY_CATEGORY = {
  'telugu-hymns': teluguHymns,
  'worship-songs': worshipSongs,
  'prayer-songs': prayerSongs,
  'kids-songs': kidsSongs,
};

export function getSongsForCategory(categoryKey) {
  return BY_CATEGORY[categoryKey]?.songs ?? [];
}

export function getLetterCounts(categoryKey) {
  return letterIndex[categoryKey]?.byLetter ?? {};
}

export function getTotalCount(categoryKey) {
  return letterIndex[categoryKey]?.totalCount ?? 0;
}

export function getSongsForLetter(categoryKey, letterKey) {
  return getSongsForCategory(categoryKey).filter((s) => s.letterKey === letterKey);
}
