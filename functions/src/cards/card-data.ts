import * as admin from 'firebase-admin';
import * as utils from '../utils';

utils.ensureFirebaseInitialized();
const PATH_CARDS = '/cards';


const cards = admin.firestore().collection(PATH_CARDS);

/**
 * Data used to create a new flashcard.
 */
export interface FlashcardCreationData {
  key: string;
  value: String;
  type: FlashcardType;
  owner: string;
  deck: string;
}

/**
 * Data used to update an existing flashcard.
 */
export interface FlashcardUpdateData {
  uid: string;
  key: string;
  value: String;
  type: FlashcardType;
  owner: string;
  deck: string;
}


/**
 * Adds a flashcard to the database.
 */
async function addCard(card: FlashcardCreationData): Promise<Flashcard> {
  try {
    const ref = await cards.add(card);
    const cardId = ref.id;
    await ref.update('uid', cardId);
    const newCard = await ref.get();
    return newCard.data() as Flashcard;
  } catch (e) {
    throw e;
  }
}

/**
 * Get data for one card.
 * @param {string} id The ID of the card  
 */
async function getCard(id: string): Promise<Flashcard> {
  try {
    const cardDoc = await cards.doc(id).get();
    const card = cardDoc.data() as Flashcard;
    return card;
  } catch (e) {
    throw e;
  }
}

async function getCards(owner: String): Promise<Array<Flashcard>> {
  try {
    const fetched = await cards.where('owner', '==', owner)
      .get();
    const result: Array<Flashcard> = fetched.docs.map(doc => doc.data() as Flashcard);
    return result;
  } catch (e) {
    throw e;
  }
}

/**
 * Updates a flashcard's info.
 *
 * @param {Flashcard} card The card to update 
 */
async function updateCard(card: FlashcardUpdateData) {
  try {
    await cards.doc(card.uid).update(card);
  } catch (e) {
    throw e;
  }
}

/**
 * Delete a flashcard from the database.
 *
 * This also verifies that the deleted card belongs to the given user
 * before it is deleted.
 *
 * @param {string} cardId The ID of the flashcard to delete
 * @param {string} ownerId The ID of the owner's flashcard
 * TODO: Throw error if the card doesn't belong to user
 */
async function deleteCard(cardId: string, ownerId: string) {
  try {
    const card = await getCard(cardId);
    if (card.owner !== ownerId) {
      // Nope.
      return
    }
    await cards.doc(cardId).delete();
    // TODO: Trigger a recalcuation of models that contain this card
  } catch (e) {
    throw e;
  }
}

export {
  addCard,
  getCard,
  getCards,
  updateCard,
  deleteCard,
};
