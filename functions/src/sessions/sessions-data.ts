import * as admin from 'firebase-admin';
import { ensureFirebaseInitialized } from '../utils';
import { StudySession, StudySessionCard } from './models';

const PATH_SESSIONS = '/sessions';

ensureFirebaseInitialized();

const sessions = admin.firestore().collection(PATH_SESSIONS);

/**
 * Data used to create a new flashcard.
 */
export interface StudySessionCreationData {

  /**
   * The moment this study session ended in ISO 8601 format.
   */
  date: string;

  /**
   * The ID of the user that studied with this session.
   */
  owner: string;

  /**
   * The IDs of the cards that were studied during this session.
   */
  cardsStudied: Array<String>;
}

/**
 * Data used to update an existing flashcard.
 */
export interface StudySessionUpdateData {
  uid: string;
  key: string;
  value: String;
  type: FlashcardType;
  owner: string;
  deck: string;
}

/**
 * Records a new study session in the database.
 */
async function addSession(session: StudySessionCreationData): Promise<StudySession> {
  try {
    const ref = await sessions.add(session);
    const cardId = ref.id;
    await ref.update('uid', cardId);
    const newCard = await ref.get();
    // Convert session.cardsStudied into data and persist that
    return newCard.data() as StudySession;
  } catch (e) {
    throw e;
  }
}

/**
 * Get data for one sudy session.
 *
 * @param {string} id The ID of the session  
 */
async function getSession(id: string): Promise<StudySession> {
  try {
    const cardDoc = await sessions.doc(id).get();
    const session = cardDoc.data() as StudySession;
    return session;
  } catch (e) {
    throw e;
  }
}

/**
 * Get all sessions belonging to th given user.
 *
 * @param {string} owner The user who generated this study session
 */
async function getSessions(owner: string): Promise<Array<StudySession>> {
  try {
    const fetched = await sessions.where('owner', '==', owner)
      .get();
    const result: Array<StudySession> = fetched.docs.map(doc => doc.data() as StudySession);
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * Delete a study session from the database.
 *
 * This also verifies that the deleted card belongs to the given user
 * before it is deleted.
 *
 * @param {string} sessionId The ID of the study session to delete
 * @param {string} ownerId The ID of the owner's flashcard
 * TODO: Throw error if the card doesn't belong to user
 */
async function deleteSession(sessionId: string, ownerId: string) {
  try {
    const session = await getSession(sessionId);
    if (session.owner !== ownerId) {
      // Nope.
      return
    }
    await sessions.doc(sessionId).delete();
    // TODO: Trigger a recalcuation of user learning model
  } catch (e) {
    throw e;
  }
}

export {
  addSession,
  getSession,
  getSessions,
  deleteSession,
};
