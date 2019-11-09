import * as admin from 'firebase-admin';
const app = admin.initializeApp();

/**
 * Checks if an auth token is valid.
 *
 * This checks if the given auth token is a valid format and is expired using
 * Firebase Auth. 
 * 
 * @param {String} token A token to check 
 * 
 * @return {Boolean} True if the auth token is valid, false otherwise. 
 */
async function verifyToken(token: string): Promise<String> {

  return admin.auth().verifyIdToken(token)
    .then(function(decodedToken) {
      let uid = decodedToken.uid;
      return uid;

    })
    .catch(function(error) {
      throw error;
    });

  



}
