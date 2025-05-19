
// digestAgent_gemini.js
const admin = require("firebase-admin");
const fs = require("fs");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const serviceAccount = require("./serviceAccountKey.json"); // Firebase Admin SDK key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = await genAI.listModels();
console.log(models);

const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: { temperature: 0.7 },
  safetySettings: [],
});


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

  const inputPrompt = "Write a 60-second podcast-style summary for the following headlines:\n\n" +
    topVideos.map(v => `In ${v.category}: ${v.title}`).join("\n");

  const result = await model.generateContent(inputPrompt);
  const response = await result.response;
  const script = response.text();

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
  console.log("✅ Gemini Digest saved. Script written to digest_script.txt");
}

// Replace with your actual userId
generateDigestForUser("115221821172220908460").catch(console.error);
