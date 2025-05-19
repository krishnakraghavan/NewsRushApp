
// digestAgent_firestore.js
const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();

const serviceAccount = require("./serviceAccountKey.json"); // Replace with your Firebase Admin SDK key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility to get today's date key
function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

async function generateDigestForUser(userId) {
  const userPrefRef = db.collection("users").doc(userId).collection("preferences").doc("settings");
  const userPrefSnap = await userPrefRef.get();
  if (!userPrefSnap.exists) {
    console.log(`❌ No preferences found for user: ${userId}`);
    return;
  }

  const prefs = userPrefSnap.data();
  const preferredCategories = prefs.categories || [];
  if (preferredCategories.length === 0) {
    console.log(`❌ No categories set for user: ${userId}`);
    return;
  }

  // Fetch top 5 recent videos matching categories
  const videosRef = db.collection("videos");
  const snapshot = await videosRef
    .where("category", "in", preferredCategories)
    .orderBy("createdAt", "desc")
    .limit(5)
    .get();

  if (snapshot.empty) {
    console.log("❌ No videos found for user prefs.");
    return;
  }

  const topVideos = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    topVideos.push({
      title: data.title,
      category: data.category,
      videoUrl: data.videoUrl,
      thumbnail: data.thumbnail || "",
    });
  });

  const prompt = "Create a 60-second script summarizing today's top news based on the following headlines:\n" +
    topVideos.map(v => `In ${v.category}: ${v.title}`).join("\n");

  const response = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
});


  const script = response.data.choices[0].message.content;
  const digestKey = getTodayKey();
  const digestDocRef = db.collection("digests").doc(`${userId}_${digestKey}`);

  await digestDocRef.set({
    userId,
    date: digestKey,
    videoUrls: topVideos.map(v => v.videoUrl),
    script,
    thumbnails: topVideos.map(v => v.thumbnail),
    status: "pending",
    createdAt: admin.firestore.Timestamp.now(),
  });

  fs.writeFileSync("digest_script.txt", script, "utf8");
  console.log("✅ Digest generated and saved to Firestore.");
}

// Replace with a valid user ID from your Firestore
generateDigestForUser("115221821172220908460").catch(console.error);
