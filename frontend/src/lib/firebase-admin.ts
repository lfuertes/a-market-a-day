import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length > 0) return getApp();

  // Prefer service account from environment variable
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    try {
      return initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
      });
    } catch (e) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", e);
    }
  }

  // Fallback to application default credentials (works in GCP/Firebase environments or via GOOGLE_APPLICATION_CREDENTIALS)
  return initializeApp({
    projectId: "market-a-day",
  });
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
