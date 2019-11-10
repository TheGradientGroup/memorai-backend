import { Request, Response } from 'express';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { addCard, getCard, getCards, deleteCard, FlashcardCreationData, updateCard, FlashcardUpdateData } from './card-data';
import { verifyToken } from '../auth';
import { getDecksByOwner, createDeck, CreateDeckRequest, deleteDeck } from './deck-data';

const PATH_DECKS = '/decks';

const PATH_CARDS = '/cards';

const SUPPORTED_METHODS = ['GET', 'POST', 'UPDATE', 'DELETE'];

export const handleCards = express();
export const handleDecks = express();

handleCards.use(cors());
handleCards.use(bodyParser.json())
handleDecks.use(cors());
handleDecks.use(bodyParser.json())

handleCards.use(PATH_CARDS, (request, response, next) => {
  if (!SUPPORTED_METHODS.includes(request.method)) {
    handleUnsupportedFunction(response);
  }
});

handleDecks.use(PATH_CARDS, (request, response, next) => {
  if (!SUPPORTED_METHODS.includes(request.method)) {
    handleUnsupportedFunction(response);
  }
});

handleCards.get(PATH_CARDS, handleCardsGet);
handleCards.post(PATH_CARDS, handleCardsPost);
handleCards.put(PATH_CARDS, handleCardsPut);
handleCards.delete(PATH_CARDS, handleCardsDelete);

handleDecks.get(PATH_DECKS, handleDeckGet);
handleDecks.post(PATH_DECKS, handleDeckPost);
handleDecks.put(PATH_DECKS, handleDeckPut);
handleDecks.delete(PATH_DECKS, handleDeckDelete);


/**
 * Handle a GET request the cards endpoint.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleCardsGet(request: Request, response: Response) {
  const body = request.body;
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }
  const owner = request.params.owner;
  if ('card' in body) {
    const cardId = body.card;
    try {
      const card = await getCard(cardId);
      if (card.owner !== owner) {
        response.status(403).send({ 'message': 'User is not authorized to get this card.' });
      }
      response.status(200).json(card);
    } catch (e) {
      console.error(e);
      sendServerError(response);
    }
  } else {
    // Return all the user's cards
    try {
      const cards = await getCards(owner);
      response.status(200).json(cards);
    } catch (e) {
      console.error(e);
      sendServerError(response);
    }
  }
}

/**
 * Handle a POST request the cards endpoint.
 * 
 * Used to create new cards.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleCardsPost(request: Request, response: Response) {
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }
  // TODO: Validate card for fields
  const cardJson = request.body as FlashcardCreationData;
  try {
    const userId = await checkAuthorization(request); // Probably a bad idea, but we need an MVP
    const cardCreationData: FlashcardCreationData = {
      key: cardJson.key,
      value: cardJson.value,
      type: cardJson.type,
      owner: userId,
      deck: cardJson.deck,
    };
    const newCard = await addCard(cardCreationData);
    response.status(200).send(newCard);
  } catch (e) {
    console.error(e);
    response.status(403).send({ 'message': 'The given owner token is invalid.' });
  }

}

/**
 * Handle a PUT request for the cards endpoint.
 * 
 * Used to update existing card values.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response
 */
async function handleCardsPut(request: Request, response: Response) {
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }
  // TODO: Validate cards
  const cardJson = request.body;
  try {
    const userId = await checkAuthorization(request); // Probably a bad idea, but we need an MVP
    const cardUpdateData: FlashcardUpdateData = {
      uid: cardJson.uid,
      key: cardJson.key,
      value: cardJson.value,
      type: cardJson.type,
      owner: userId,
      deck: cardJson.deck,
    };
    await updateCard(cardUpdateData);
    response.status(200);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}

/**
 * Handle a DELETE request for the cards endpoint.
 * 
 * Used to delete cards.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response
 */
async function handleCardsDelete(request: Request, response: Response) {
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }

  if (!('cardId' in request.body)) {
    response.status(400).send({ 'message': 'cardId not provided' });
  }
  let userId;
  try {
    userId = await checkAuthorization(request); // Probably a bad idea, but we need an MVP
  } catch (e) {
    console.error(e);
    response.status(403).send({ 'message': 'The given owner token is invalid.' });
    return;
  }
  const cardId = request.body.cardId;
  try {
    // TODO: Check user owns card
    await deleteCard(cardId, userId);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}

/**
 * Checks if the request's owner token is valid. 
 *
 * Assumes that the user is already authenticated and there is an owner query
 * parameter in the request.
 * 
 * @param {Response} response A request object to check
 * 
 * @return {Promise<string>} A promise that resolves to the user ID of the token if it is valid.
 *
 * @throws {Error} If the token is invalid.
 */
export async function checkAuthorization(request: Request): Promise<string> {
  const token = request.query.owner;
  const userId = await verifyToken(token);
  return userId;
}

/**
 * Sends a 401 error when a user has provided no credentials.
 *
 * @param {Request} request A request to check
 * @param {Response} response A response object to use 
 */
export function checkAuthentication(request: Request) {
  const authenticated = 'owner' in request.query;
  return authenticated;
}

/**
 * 
 * @param {Response} response Response to send data
 */
export function sendServerError(response: Response) {
  response.send(500).send({ 'message': 'Internal server error.' });
}

/**
 * Send an error response.
*/
function handleUnsupportedFunction(response: Response) {
  response.status(405).send({ 'errorMessage': 'Method not supported.' });
}

// Deck handling functions

async function handleDeckGet(request: Request, response: Response) {
  if (!checkAuthentication(request)) {
    response.status(401).send({ 'message': 'No owner token has been provided' });
  }
  try {
    let userId: string;
    try {
      userId = await checkAuthorization(request);
    } catch (e) {
      response.send(403).send({ 'message': 'The given owner token is invalid' });
      return;
    }
    const decks = await getDecksByOwner(userId);
    response.status(200).json(decks);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}

/**
 * Handle deck creation (POST) requests.
 * 
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleDeckPost(request: Request, response: Response) {
  if (!checkAuthentication(request)) {
    response.status(401).send({ 'message': 'No owner token has been provided' });
  }
  try {
    let userId: string;
    try {
      userId = await checkAuthorization(request);
    } catch (e) {
      response.send(403).send({ 'message': 'The given owner token is invalid' });
      return;
    }
    const deck = request.body;
    // TODO: Actually verify if deck has values
    const createDeckRequest: CreateDeckRequest = {
      title: deck.title,
      description: deck.description,
      cards: deck.cards,
      owner: userId,
    };
    const newDeck = await createDeck(createDeckRequest);
    response.status(200).json(newDeck);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}

/**
 * Handle deck update (PUT) requests.
 * 
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleDeckPut(request: Request, response: Response) {
  if (!checkAuthentication(request)) {
    response.status(401).send({ 'message': 'No owner token has been provided' });
  }
  try {
    let userId: string;
    try {
      userId = await checkAuthorization(request);
    } catch (e) {
      response.send(403).send({ 'message': 'The given owner token is invalid' });
      return;
    }
    const deck = request.body;
    // TODO: Actually verify if deck has values
    const createDeckRequest: CreateDeckRequest = {
      title: deck.title,
      description: deck.description,
      cards: deck.cards,
      owner: userId,
    };
    const newDeck = await createDeck(createDeckRequest);
    response.status(200).json(newDeck);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}

/**
 * Handle deck delete (DELETE) requests.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleDeckDelete(request: Request, response: Response) {
  if (!checkAuthentication(request)) {
    response.status(401).send({ 'message': 'No owner token has been provided' });
  }
  try {
    let userId: string;
    try {
      userId = await checkAuthorization(request);
    } catch (e) {
      response.send(403).send({ 'message': 'The given owner token is invalid' });
      return;
    }
    if (!('deckId' in request.body)) {
      response.status(400).send({ 'message': 'Delete request must have deckId body parameter' });
    }
    const deckId = request.body.deckId;
    await deleteDeck(deckId, userId);
    response.status(200);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}