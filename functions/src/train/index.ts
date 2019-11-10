import * as express from 'express';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import * as multer from 'multer';
import * as cors from 'cors';
import { StudySession } from '../sessions/models';

const upload = multer();

export const handleSessions = express();

export const handleModelUpload = express();

handleSessions.use(cors());
handleSessions.use(bodyParser.json());

handleModelUpload.use(cors());
handleModelUpload.use(bodyParser);
handleModelUpload.put('/models/:userId', upload.single(), uploadModel);

/**
 * Handles a TensorFlow JS model upload
 */
function uploadModel(request: Request, response: Response) {
  throw Error('Not implemented.');
}

/**
 * 
 * @param {Request} request The request to handle
 * @param {Response} response The response to handle
 */
export function handleTrain(request: Request, response: Response) {
  response.sendStatus(200);
}

/**
 * Trigger the thign to start retraining the model
 * @param session 
 */
export function onSessionAdded(session: StudySession) {
  session.cardsStudied.map(({ cardId, correct, difficulty, duration }) => {
    return;
  });
}