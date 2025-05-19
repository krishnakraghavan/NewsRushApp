require('dotenv').config();
const { fetchChannelVideosById } = require('./services/youtubeFetcher');
const { getKeywords, saveVideoToFirestore } = require('./services/firestoreService');

const channels = [
  // 🟦 English
  { name: '@BrutIndia', id: 'UCCgQaXjsJ6EdFPZeTFQoSyw', lang: 'en' },
  { name: '@DWNews', id: 'UCknLrEdhRCp1aegoMqRaCZg', lang: 'en' },
  { name: '@Bloomberg', id: 'UCIALMKvObZNtJ6AmdCLP7Lg', lang: 'en' },

  // 🟧 Hindi
  { name: '@AajTak', id: 'UCt4t-jeY85JegMlZ-E5UWtA', lang: 'hi' },
  { name: '@abpnewstv', id: 'UCRWFSbif-RFENbBrSiez1DA', lang: 'hi' },
  { name: '@ZeeNews', id: 'UCIvaYmXn910QMdemBG3v1pQ', lang: 'hi' },

  // 🟥 Telugu
  { name: '@TV5news', id: 'UCAR3h_9fLV82N2FH4cE4RKw', lang: 'te' },
  { name: '@TV9TeluguLive', id: 'UCPXTXMecYqnRKNdqdVOGSFg', lang: 'te' },
  { name: '@ntvteluguofficial', id: 'UCumtYpCY26F6Jr3satUgMvA', lang: 'te' },
  { name: '@abntelugutv', id: 'UC_2irx_BQR7RsBKmUV9fePQ', lang: 'te' }
];


(async () => {
  try {
    const keywords = await getKeywords(); // Can be [] if not used

for (let { name, id, lang } of channels) {
  console.log(`\n🎥 Fetching videos for ${name}...`);
  const videos = await fetchChannelVideosById(id, keywords);
  console.log(`📦 ${videos.length} videos retrieved.`);

  for (let video of videos) {
    // Log the kind and title to debug
    console.log(`🔍 Checking: ${video.snippet?.title} (${video.id.kind})`);

    if (video.id.kind !== 'youtube#video') {
      console.log(`⏭️ Skipped non-video item.`);
      continue;
    }

    await saveVideoToFirestore(video, lang);
    console.log(`✅ Saved: ${video.snippet.title}`);
  }
}
     console.log('\n🚀 All videos fetched and saved!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
