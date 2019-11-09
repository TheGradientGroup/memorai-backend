import * as functions from 'firebase-functions';
import { handlePrediction } from './predict';
import { handleCards } from './cards';
import { handleTrain } from './train';

export const posts = functions.https.onRequest(handleCards);

export const predict = functions.https.onRequest(handlePrediction);

export const train = functions.https.onRequest(handleTrain);
