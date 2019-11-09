/**
 * The primary data model for MemorAI.
 */
interface Flashcard {
  /**
   * The primary identifier for this card, like a term.
   */
  key: String,
  /**
   * The value of this card.
   * 
   * Either a string or 
   */
  value: String | URL,

  /**
   * The type of content this card holds.
   */
  type: FlashcardType,

  /**
   * The user ID of this card's owner.
   */
  owner: String,
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