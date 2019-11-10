import { Request, Response } from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { getSession, getSessions, StudySessionCreationData, addSession, deleteSession } from './sessions-data';
import { checkAuthorization, sendServerError, checkAuthentication, handleUnsupportedFunction } from '../utils';

const PATH_SESSIONS = '/sessions';

const SUPPORTED_METHODS = ['GET', 'POST', 'DELETE'];

export const handleSessions = express();

handleSessions.use(bodyParser.json())

handleSessions.use(PATH_SESSIONS, (request, response, next) => {
  if (!SUPPORTED_METHODS.includes(request.method)) {
    handleUnsupportedFunction(response);
  }
});

handleSessions.get(PATH_SESSIONS, handleSessionsGet);
handleSessions.post(PATH_SESSIONS, handleSessionsPost);
handleSessions.delete(PATH_SESSIONS, handleSessionsDelete);

/**
 * Handle a GET request the sessions endpoint.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleSessionsGet(request: Request, response: Response) {
  const body = request.body;
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }
  const owner = request.params.owner;
  if ('sessionId' in body) {
    const sessionId = body.sessionId;
    try {
      const session = await getSession(sessionId);
      if (session.owner !== owner) {
        response.status(403).send({ 'message': 'User is not authorized to get this card.' });
      }
      response.status(200).json(session);
    } catch (e) {
      console.error(e);
      sendServerError(response);
    }
  } else {
    try {
      const sessions = await getSessions(owner);
      response.status(200).json(sessions);
    } catch (e) {
      console.error(e);
      sendServerError(response);
    }
  }
}

/**
 * Handle a POST request the sessions endpoint.
 * 
 * Used to record new sessions.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response 
 */
async function handleSessionsPost(request: Request, response: Response) {
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }
  // TODO: Validate card for fields
  const cardJson = request.body;
  try {
    const userId = await checkAuthorization(request); // Probably a bad idea, but we need an MVP
    const cardCreationData: StudySessionCreationData = {
      date: cardJson.date,
      cardsStudied: cardJson.cardsStudied,
      owner: userId,
    };
    const newSession = await addSession(cardCreationData);
    response.status(200).send(newSession);
  } catch (e) {
    console.error(e);
    response.status(403).send({ 'message': 'The given owner token is invalid.' });
  }
}

/**
 * Handle a DELETE request for the sessions endpoint.
 * 
 * Used to delete study sessions.
 *
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response
 */
async function handleSessionsDelete(request: Request, response: Response) {
  if (!request.is('application/json')) {
    response.send(400);
  }
  if (!checkAuthentication(request)) {
    return;
  }

  if (!('sessionId' in request.body)) {
    response.status(400).send({ 'message': 'sessionId not provided' });
    return;
  }
  let userId;
  try {
    userId = await checkAuthorization(request); // Probably a bad idea, but we need an MVP
  } catch (e) {
    console.error(e);
    response.status(403).send({ 'message': 'The given owner token is invalid.' });
    return;
  }
  const sessionId = request.body.cardId;
  try {
    // TODO: Check user owns card
    await deleteSession(sessionId, userId);
  } catch (e) {
    console.error(e);
    sendServerError(response);
  }
}
