# Song input folders

Each folder here feeds one of the 4 left-hand cards on the Home screen.
Drop `.docx` files (Word documents) with song lyrics into the matching
folder, then run:

```bash
npm run generate:songs
```

(also runs automatically after `npm install`). This converts every `.docx`
in these folders into the data the app actually reads
(`src/data/songs/<folder-name>.json`) — restart the app afterwards to see
the new songs.

| Folder            | Shows up as (Home screen card, as of now — see `src/data/homeCards.js` if it's been renamed) |
| ------------------ | ----------------------------------- |
| `telugu-hymns/`    | తెలుగు క్రిస్తవ కీర్తనలు |
| `worship-songs/`   | క్రీస్తవ సునాద కీర్తనలు |
| `prayer-songs/`    | సండే స్కూల్ కీర్తనలు |
| `kids-songs/`      | ప్రత్యేక కీర్తనలు |

Don't rename these 4 folders — their names are how the app matches a card
to its songs. You can add as many `.docx` files as you like inside a
folder; they all get merged together.

## Format each `.docx` must follow

Put any number of songs in one file, one after another. Each song starts
with a line containing **only a number and a dot** — that's what marks a
new song. Everything after it, up to the next such line, is that song's
lyrics:

```
3.
పరలోకమున నుండు దేవ నీ పదముల కొనరింతు సేవ
నేను వెఱచి యున్నానని కరుణించి నీ సుతుని ధర కంపితివి
...

4.
దేవా దివ్యానంత ప్రభావ మాంపాహి ఘన యెహోవా
...
```

A few things to know:

- A song's **title is just its first line** — same as printed hymn books,
  where a song is identified by its opening line, not a separate title
  field. Whatever the first line of a song is, that's what shows in the
  song list.
- The app **automatically files each song under its first Telugu letter**
  — a song starting "ధి..." appears under ధ, no manual sorting needed.
- Verse numbers *inside* a song's lyrics (like `1.తండ్రి కుమార...` with no
  space after the dot, marking verse 1 of that song) are left alone and
  kept as part of the lyrics. Only a line that is *only* a number and a
  dot, on its own line, starts a brand new song.
- Keep numbering sequential within each file (1., 2., 3., ...); if you add
  more files to the same folder later, each file can restart its own
  numbering — they won't collide.

If something doesn't parse the way you expect, open the generated
`src/data/songs/<folder>.json` after running the command above and check
which song boundary it split on.
