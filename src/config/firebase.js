import admin from "firebase-admin";

// Initialize Firebase Admin SDK using environment variables
// Copy .env.example to .env and fill in your credentials
try {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin SDK initialized");
  } else {
    console.warn("⚠️  Firebase Admin SDK not configured. Set FIREBASE_ADMIN_* vars in .env");
  }
} catch (error) {
  console.error("❌ Firebase init failed:", error.message);
}

export default admin;