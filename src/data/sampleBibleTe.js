// TEMPORARY placeholder data for the Bible screen.
//
// This is only a handful of well-known verses so the screen has something
// real to render during testing. Replace this file with a full Telugu
// Bible dataset (e.g. a JSON export of a licensed Telugu translation) when
// you're ready — the screen just maps over `books`, so any data shaped like
// this will work without further UI changes.

export const sampleBibleTe = {
  note: 'నమూనా వచనాలు మాత్రమే — పూర్తి బైబిల్ త్వరలో జోడించబడుతుంది.',
  noteEn: 'Sample verses only — the full Bible will be added later.',
  books: [
    {
      book: 'ఆదికాండము',
      bookEn: 'Genesis',
      chapter: 1,
      verses: [
        { num: 1, te: 'ఆదియందు దేవుడు భూమిని ఆకాశమును సృజించెను.', en: 'In the beginning God created the heavens and the earth.' },
        { num: 2, te: 'భూమి నిరాకారముగాను శూన్యముగాను ఉండెను; చీకటి అగాధ జలముపైన కమ్మియుండెను.', en: 'The earth was without form and void, and darkness was over the face of the deep.' },
      ],
    },
    {
      book: 'కీర్తనలు',
      bookEn: 'Psalms',
      chapter: 23,
      verses: [
        { num: 1, te: 'యెహోవా నా కాపరి, నాకు లేమి కలుగదు.', en: 'The Lord is my shepherd; I shall not want.' },
        { num: 2, te: 'పచ్చిక గల చోట్లను ఆయన నన్ను పరుండజేయుచున్నాడు; శాంతికరమైన జలముల యొద్దకు నన్ను నడిపించుచున్నాడు.', en: 'He makes me lie down in green pastures; He leads me beside still waters.' },
      ],
    },
    {
      book: 'యోహాను సువార్త',
      bookEn: 'John',
      chapter: 3,
      verses: [
        { num: 16, te: 'దేవుడు లోకమును ఎంతో ప్రేమించెను, కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.', en: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.' },
      ],
    },
  ],
};
