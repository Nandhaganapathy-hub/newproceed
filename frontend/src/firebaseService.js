/**
 * Firebase Firestore Service Layer
 * Centralizes all Firestore reads/writes for the Living Ledger app.
 * Each page component imports only the functions it needs.
 */
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
} from 'firebase/firestore';

// ─── Collection References ───────────────────────────────────────
const alertsCol   = collection(db, 'alerts');
const ngosCol     = collection(db, 'ngos');
const footfallCol = collection(db, 'footfall');
const surplusCol  = collection(db, 'surplus_food');
const statsCol    = collection(db, 'dashboard_stats');
const logsCol     = collection(db, 'activity_logs');

// ─── ALERTS ──────────────────────────────────────────────────────

/** Subscribe to real-time alerts. Returns unsubscribe function. */
export function subscribeToAlerts(callback) {
  const q = query(alertsCol, orderBy('created_at', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  }, (error) => {
    console.warn('Firebase alerts listener error:', error);
  });
}

/** Add a new alert to Firestore */
export async function addAlert(alert) {
  return addDoc(alertsCol, {
    ...alert,
    created_at: serverTimestamp(),
  });
}

/** Delete an alert from Firestore */
export async function deleteAlert(alertId) {
  return deleteDoc(doc(db, 'alerts', alertId));
}

// ─── NGOs ────────────────────────────────────────────────────────

/** Sync all NGOs to Firestore (used for initial data push) */
export async function syncNGOsToFirestore(ngos) {
  for (const ngo of ngos) {
    const docRef = doc(db, 'ngos', String(ngo.id || ngo.name));
    await setDoc(docRef, {
      ...ngo,
      synced_at: serverTimestamp(),
    }, { merge: true });
  }
}

/** Subscribe to real-time NGO updates. Returns unsubscribe function. */
export function subscribeToNGOs(callback) {
  return onSnapshot(ngosCol, (snapshot) => {
    const ngos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(ngos);
  }, (error) => {
    console.warn('Firebase NGOs listener error:', error);
  });
}

/** Add or update an NGO in Firestore */
export async function upsertNGO(ngoData) {
  if (ngoData.id) {
    const docRef = doc(db, 'ngos', String(ngoData.id));
    await setDoc(docRef, { ...ngoData, synced_at: serverTimestamp() }, { merge: true });
    return ngoData.id;
  } else {
    const docRef = await addDoc(ngosCol, { ...ngoData, synced_at: serverTimestamp() });
    return docRef.id;
  }
}

/** Delete an NGO from Firestore */
export async function deleteNGO(ngoId) {
  return deleteDoc(doc(db, 'ngos', String(ngoId)));
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────

/** Update live dashboard stats in Firestore */
export async function updateDashboardStats(stats) {
  const docRef = doc(db, 'dashboard_stats', 'live');
  await setDoc(docRef, {
    ...stats,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

/** Subscribe to live dashboard stats */
export function subscribeToDashboardStats(callback) {
  const docRef = doc(db, 'dashboard_stats', 'live');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  }, (error) => {
    console.warn('Firebase dashboard stats error:', error);
  });
}

// ─── ACTIVITY LOGS ───────────────────────────────────────────────

/** Add an activity log entry */
export async function addActivityLog(log) {
  return addDoc(logsCol, {
    ...log,
    timestamp: serverTimestamp(),
  });
}

/** Subscribe to recent activity logs */
export function subscribeToActivityLogs(callback) {
  const q = query(logsCol, orderBy('timestamp', 'desc'), limit(10));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(logs);
  });
}

// ─── SURPLUS FOOD ────────────────────────────────────────────────

/** Add surplus food entry to Firestore */
export async function addSurplusFood(data) {
  return addDoc(surplusCol, {
    ...data,
    created_at: serverTimestamp(),
  });
}

/** Subscribe to surplus food updates */
export function subscribeToSurplusFood(callback) {
  const q = query(surplusCol, orderBy('created_at', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
}

// ─── FOOTFALL ────────────────────────────────────────────────────

/** Add footfall entry to Firestore */
export async function addFootfall(data) {
  return addDoc(footfallCol, {
    ...data,
    recorded_at: serverTimestamp(),
  });
}

/** Subscribe to footfall updates */
export function subscribeToFootfall(callback) {
  const q = query(footfallCol, orderBy('recorded_at', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(entries);
  });
}
