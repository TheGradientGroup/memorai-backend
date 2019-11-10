// import * as admin from 'firebase-admin';

// const PATH_DECKS = '/decks';

// const decks = admin.firestore().collection(PATH_DECKS);

/**
 * Returns all decks that the user should be learning.
 *
 * @param {string} userId The ID of the user 
 */
export async function getMostRelevantDecks(userId: string) {
  // Iterate through all decks
  // Order by average
  // Return any before due date
  try {
    // const deckDocs = await decks.where('owner', '==', userId).get();
    // deckDocs.
    return;
  } catch (e) {
    throw e;
  }
}