/**
 * A record of cards reviewed at an instance.
 */
export interface StudySession {

  /**
   * A unique identifier for this session.
   */
  uid: string;

  /**
   * The ID of the user that studied with this session.
   */
  owner: string;

  /**
   * The moment this study session ended in ISO 8601 format.
   */
  date: string;

  /**
   * The items that were studied during this session.
   */
  cardsStudied: Array<StudySessionCard>;
}

/**
 * A record of one card's performance in a study session.
 */
export interface StudySessionCard {

  /**
   * The UID of the card that was learned or not
   */
  cardId: string;

  /**
   * True if this card was assumed correct by the user.
   */
  correct: number;
  
  /**
   * A user-specified value from 0 to 1 where 0 is "very easy" and 1 is "most difficult".
   */
  difficulty: number;
  
  /**
   * The time in milliseconds it took to recall (flip) this card.
   */
  duration: number;
}