import * as admin from 'firebase-admin';

let firebaseIsInitialized = false;

/**
 * Ensures that the default Firebase app initialized.
 */
export function ensureFirebaseInitialized() {
  if (!firebaseIsInitialized) {
    admin.initializeApp();
    firebaseIsInitialized = true;
  }
}