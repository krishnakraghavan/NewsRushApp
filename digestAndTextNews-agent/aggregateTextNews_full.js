
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config();
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const FALLBACK_IMAGE = "https://via.placeholder.com/150";

async function fetchTopNews() {
  const url = `https://newsapi.org/v2/everything?q=india&sortBy=publishedAt&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();
  return json.articles || [];
}

function mockFactCheck(title) {
  const isFactChecked = Math.random() > 0.4;
  return {
    factChecked: isFactChecked,
    trustScore: isFactChecked ? Math.floor(Math.random() * 21) + 80 : null,
    factSource: isFactChecked ? "MockFact.org" : null,
    factSummary: isFactChecked ? "Validated by mock AI agent using public sources." : null
  };
}

async function aggregateNews() {
  const articles = await fetchTopNews();
  const ref = db.collection("textNews");

console.log("Fetched articles:", articles);

  for (const item of articles) {
    const {
      title,
      description,
      urlToImage,
      url,
      source,
      publishedAt
    } = item;

    const factData = mockFactCheck(title);
console.log("Uploading article:", title);

    await ref.add({
      title: title || "Untitled",
      summary: description || "No summary available.",
      category: "General",
      source: source?.name || "Unknown",
      sourceUrl: url,
      thumbnail: urlToImage || FALLBACK_IMAGE,
      language: "en",
      createdAt: Timestamp.fromDate(new Date(publishedAt || Date.now())),
      openInApp: true,
      ...factData
    });
  }

  console.log("✅ News articles with thumbnails and fact-check metadata uploaded.");
}

aggregateNews().catch(console.error);
