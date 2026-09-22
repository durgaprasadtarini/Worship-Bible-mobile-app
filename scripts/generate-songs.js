#!/usr/bin/env node
/**
 * Converts the .docx song sheets under assets/inputs/<category>/ into JSON
 * data the app actually ships and reads (src/data/songs/<category>.json).
 *
 * Why: a phone app can't parse Word documents on the fly, so this script is
 * the one-time (per edit) build step that turns "someone's Word doc of
 * lyrics" into plain data the app already knows how to render.
 *
 * Run it with:  npm run generate:songs
 * It also runs automatically after `npm install` (see package.json
 * "postinstall") — but if you only *edit* a .docx without reinstalling,
 * run the command above yourself before testing/building.
 *
 * ── Format each .docx must follow ───────────────────────────────────────
 * Put any number of songs in one file (or split across several files in
 * the same category folder — they all get merged). Each song looks like:
 *
 *   3.
 *   పరలోకమున నుండు దేవ నీ పదముల కొనరింతు సేవ ...
 *   (rest of the lyrics — verses, refrain, etc. — however many lines)
 *
 *   4.
 *   దేవా దివ్యానంత ప్రభావ మాంపాహి ఘన యెహోవా
 *   ...
 *
 * i.e. a line containing ONLY a number and a dot (e.g. "3.") starts a new
 * song; everything until the next such line is that song's lyrics. The
 * song's title is just its first line — same convention as printed hymn
 * books, where songs are identified by their opening line, not a separate
 * title. Numbers inside the lyrics themselves (verse markers like
 * "1.తండ్రి కుమార..." with no space after the dot) are left alone and
 * kept as part of the lyrics — only a lone "N." on its own line is treated
 * as a song boundary.
 *
 * Which Telugu letter a song is filed under is decided automatically: the
 * first Telugu letter of its title (e.g. a song starting "ధి..." files
 * under ధ) — no need to sort anything by hand.
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = path.join(__dirname, '..');
const INPUT_DIR = path.join(ROOT, 'assets', 'inputs');
const OUTPUT_DIR = path.join(ROOT, 'src', 'data', 'songs');

// Keep this in sync with src/data/homeCards.js (`id`) and
// src/data/teluguAlphabet.js.
const CATEGORIES = ['telugu-hymns', 'worship-songs', 'prayer-songs', 'kids-songs'];

const TELUGU_LETTERS = [
  'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ',
  'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ',
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ', 'శ',
  'ష', 'స', 'హ', 'ళ', 'ఱ',
];
const OTHER_LETTER_KEY = 'ఇతర'; // "other" bucket for titles with no Telugu letter

function docxToPlainText(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry('word/document.xml');
  if (!entry) return '';
  let xml = zip.readAsText(entry);
  xml = xml.replace(/<\/w:p>/g, '\n'); // paragraph end -> newline
  xml = xml.replace(/<w:br[^>]*\/>/g, '\n'); // explicit line break -> newline
  xml = xml.replace(/<w:tab[^>]*\/>/g, '\t');
  xml = xml.replace(/<[^>]+>/g, ''); // strip all remaining tags
  xml = xml
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  return xml;
}

function firstLetterKey(title) {
  for (const ch of title) {
    if (TELUGU_LETTERS.includes(ch)) return ch;
  }
  return OTHER_LETTER_KEY;
}

function parseSongsFromText(text, fileTag) {
  const rawLines = text.split('\n').map((l) => l.trim());
  const songs = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    // Trim leading/trailing blank lines, keep internal ones (stanza breaks).
    while (current.lines.length && current.lines[0] === '') current.lines.shift();
    while (current.lines.length && current.lines[current.lines.length - 1] === '') current.lines.pop();
    if (current.lines.length === 0) return; // boundary marker with nothing after it
    const title = current.lines.find((l) => l !== '') || `Song ${current.number}`;
    songs.push({
      id: `${fileTag}-${current.number}`,
      number: current.number,
      title,
      lyrics: current.lines.join('\n'),
      letterKey: firstLetterKey(title),
    });
  };

  for (const line of rawLines) {
    const boundaryMatch = line.match(/^(\d+)\.\s*$/);
    if (boundaryMatch) {
      pushCurrent();
      current = { number: parseInt(boundaryMatch[1], 10), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
    // Lines before the very first boundary marker (e.g. a blank title page)
    // are intentionally ignored.
  }
  pushCurrent();
  return songs;
}

function processCategory(categoryKey) {
  const dir = path.join(INPUT_DIR, categoryKey);
  let songs = [];

  if (fs.existsSync(dir)) {
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.docx'))
      .sort();

    files.forEach((file, fileIndex) => {
      const fullPath = path.join(dir, file);
      try {
        const text = docxToPlainText(fullPath);
        const fileTag = `${categoryKey}-f${fileIndex}`;
        const parsed = parseSongsFromText(text, fileTag);
        songs = songs.concat(parsed);
        console.log(`  ${file}: ${parsed.length} song(s)`);
      } catch (err) {
        console.warn(`  ! Skipped ${file} (could not read as .docx): ${err.message}`);
      }
    });
  }

  const byLetter = {};
  for (const song of songs) {
    byLetter[song.letterKey] = (byLetter[song.letterKey] || 0) + 1;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${categoryKey}.json`),
    JSON.stringify({ category: categoryKey, songs }, null, 2),
    'utf8'
  );

  return { totalCount: songs.length, byLetter };
}

function main() {
  console.log('Generating song data from assets/inputs/ ...\n');
  const index = {};
  for (const categoryKey of CATEGORIES) {
    console.log(`[${categoryKey}]`);
    index[categoryKey] = processCategory(categoryKey);
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf8');

  console.log('\nDone:');
  for (const key of CATEGORIES) {
    console.log(`  ${key}: ${index[key].totalCount} song(s)`);
  }
}

main();
