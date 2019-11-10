import * as admin from 'firebase-admin';

const PATH_DECKS = '/decks';

const decks = admin.firestore().collection(PATH_DECKS);

/**
 * Fetches deck information by ID.
 *
 * @param {string} deckId The ID of the deck to fetch 
 */
export async function getDeckById(deckId: string): Promise<FlashcardDeck> {
  try {
    // TODO: Validate that deck exists
    const doc = await decks.doc(deckId).get();
    const deck = doc.data() as FlashcardDeck;
    // TODO: Have prediction endpoint trigger a recalculation of needToLearnCards 
    // TODO: Determine amount of cards still needed to learn
    console.log('Fetched deck', deck);
    return deck;
  } catch (e) {
    throw e;
  }
}

/**
 * Fetches all decks belonging to the given user.
 *
 * @param {string} userId Decks belonging to this user will be fetched
 * @param {boolean} forHomescreen True if a limited subset of data should be fetched
 */
export async function getDecksByOwner(userId: string,
  forHomescreen: boolean = false): Promise<Array<FlashcardDeck>> {
  try {
    const query = decks.where('owner', '==', userId);
    const docs = await query.get();
    const fetchedDecks = docs.docs.map((doc) => {
      return doc.data() as FlashcardDeck;
    });
    console.log(`Fetched deck from user ${userId}`, fetchedDecks);
    return fetchedDecks;
  } catch (e) {
    throw e;
  }
}

/**
 * Data needed to create a new deck.
 */
export interface CreateDeckRequest {

  /**
   * The title for this deck.
   */
  title: string;

  /**
   * A description for this deck.
   */
  description: string;

  /**
   * The cards contained within this set.
   */
  cards: Array<Flashcard>;

  /**
   * The user ID of this flashcard set's owner.
   */
  owner: string;
}

/**
 * Uploads a deck of Flashcards and associates them with a given owner.
 * 
 * @param {CreateDeckRequest} deck Information used to create a deck
 */
export async function createDeck(deck: CreateDeckRequest) {
  try {
    const deckRef = await decks.add(deck);
    await deckRef.update('owner', deck.owner);
    const newDeck = await deckRef.get();
    // TODO: Set initial cards to learn
    const deckData = newDeck.data();
    return deckData;
  } catch (e) {
    throw e;
  }
}

/**
 * Deletes a deck from the database.
 *
 * This also verifies that the deleted card belongs to the given user
 * before it is deleted.
 *
 * @param {string} deckId The ID of the deck to delete
 * @param {string} ownerId The ID of the owner's flashcard
 */
export async function deleteDeck(deckId: string, ownerId: string) {
  try {
    const deck = await getDeckById(deckId);
    if (deck.owner !== ownerId) {
      // Nope.
      return
    }
    await decks.doc(deckId).delete();
    // TODO: Actually delete all cards in deck based on ID
  } catch (e) {
    throw e;
  }
}