import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Checks if an auth token is valid.
 *
 * This checks if the given auth token is a valid format and is expired using
 * Firebase Auth. 
 * 
 * @param {string} token A token to check 
 * 
 * @return {Promise<string>} Promise that resolve to the user ID from the
 * given token. 
 */
export async function verifyToken(token: string): Promise<string> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    return uid;
  } catch (e) {
    // TODO: Abstract Firebase away from this
    throw e;
  }
}
