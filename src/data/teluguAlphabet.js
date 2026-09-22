// Standard Telugu varnamala (vowels + consonants), used for the
// "browse by letter" placeholder screen shown from every left-hand
// home card for now (per the current basic-version scope).

export const teluguVowels = [
  'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ౠ',
  'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం', 'అః',
];

export const teluguConsonants = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ', 'శ',
  'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ',
];

export const teluguAlphabet = [...teluguVowels, ...teluguConsonants];
