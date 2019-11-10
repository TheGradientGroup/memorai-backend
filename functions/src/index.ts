import * as functions from 'firebase-functions';
import { handleCards, handleDecks } from './cards';
// import { handlePrediction } from './predict';
// import { handleTrain } from './train';

export const posts = functions.https.onRequest(handleCards);

export const decks = functions.https.onRequest(handleDecks);

// export const predict = functions.https.onRequest(handlePrediction);

// export const train = functions.https.onRequest(handleTrain);
