/**
 * The primary data model for MemorAI.
 */
interface Flashcard {

  uid: string;

  /**
   * The primary identifier for this card, like a term.
   */
  key: string;

  /**
   * The value of this card.
   * 
   * Either a string or 
   */
  value: String | URL;

  /**
   * The type of content this card holds.
   */
  type: FlashcardType;

  /**
   * The user ID of this card's owner.
   */
  owner: String;
}

/**
 * A group of flashcards.
 */
interface FlashcardDeck {

  /**
   * A unique identifier for this deck.
   */
  uid: string;

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

  /**
   * The cards 
   */
  cardsDue: Array<Flashcard>;
}

/**
 * A type of media.
 */
enum FlashcardType {
  TEXT,
  IMAGE,
  AUDIO,
  VIDEO,
}
