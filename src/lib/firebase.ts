import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  RankProfile, 
  ScoreCard, 
  BossQuestion, 
  IeltsMockTest, 
  IeltsWordCard, 
  IeltsWritingSubmission,
  IeltsSpeakingSubmission,
  Mode 
} from '../types/study';

export interface StudySyncData {
  mode?: Mode;
  profile?: RankProfile;
  scoreCards?: ScoreCard[];
  bosses?: BossQuestion[];
  ieltsTests?: IeltsMockTest[];
  ieltsWords?: IeltsWordCard[];
  ieltsWritings?: IeltsWritingSubmission[];
  ieltsSpeakings?: IeltsSpeakingSubmission[];
  updatedAt?: string;
  sourceDevice?: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let activeCollection = 'budgets'; // Defaults to 'budgets' which has active read/write rules
const PRIMARY_DOC_ID = 'schstudy_main';

export function getFirebaseConfig() {
  if (typeof window === 'undefined') return null;

  // 1. Custom config from LocalStorage
  const customConfig = localStorage.getItem('schstudy_firebase_config') || localStorage.getItem('sch_budget_firebase_config');
  if (customConfig) {
    try {
      return JSON.parse(customConfig);
    } catch {}
  }

  // 2. Next.js Public Environment Variables
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function initFirebase(force = false): Firestore | null {
  if (db && !force) return db;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length === 0 || force) {
      app = initializeApp(config, force ? `schstudy-${Date.now()}` : 'schstudy');
    } else {
      const existing = getApps().find(a => a.name === 'schstudy');
      app = existing || getApp();
    }
    db = getFirestore(app);
    return db;
  } catch (err) {
    console.warn('Firebase başlatılamadı, yerel modda devam ediliyor:', err);
    return null;
  }
}

export function getCurrentFirebaseProject(): string | null {
  const config = getFirebaseConfig();
  return config?.projectId || null;
}

export async function testFirebaseConnection(): Promise<{ success: boolean; error?: string }> {
  const firestore = initFirebase();
  if (!firestore) return { success: false, error: 'Firebase yapılandırması eksik veya başlatılamadı.' };

  try {
    const testDoc = doc(firestore, 'budgets', 'schstudy_health_check');
    await setDoc(testDoc, { ping: true, time: new Date().toISOString() });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}

// Push local study data to Firestore
export async function pushStudyDataToCloud(data: StudySyncData): Promise<boolean> {
  const firestore = initFirebase();
  if (!firestore) return false;

  try {
    const docRef = doc(firestore, activeCollection, PRIMARY_DOC_ID);
    // Firestore undefined alanları kabul etmediğinden sterilize ediyoruz
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore buluta yazma hatası:', err);
    return false;
  }
}

// Fetch all study data once
export async function fetchStudyDataFromCloud(): Promise<StudySyncData | null> {
  const firestore = initFirebase();
  if (!firestore) return null;

  try {
    const docRef = doc(firestore, activeCollection, PRIMARY_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudySyncData;
    }
    return null;
  } catch (err) {
    console.error('Firestore okuma hatası:', err);
    return null;
  }
}

// Real-time listener across devices (PC <-> Phone)
export function subscribeToStudyData(
  onUpdate: (data: StudySyncData) => void,
  onError?: (err: Error) => void
): () => void {
  const firestore = initFirebase();
  if (!firestore) return () => {};

  const docRef = doc(firestore, activeCollection, PRIMARY_DOC_ID);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as StudySyncData;
      onUpdate(data);
    }
  }, (err) => {
    console.warn('Firestore gerçek zamanlı dinleme uyarısı:', err);
    if (onError) onError(err);
  });
}
