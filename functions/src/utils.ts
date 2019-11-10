import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import { verifyToken } from './auth';

let firebaseIsInitialized = false;

/**
 * Ensures that the default Firebase app initialized.
 */
export function ensureFirebaseInitialized() {
  if (!firebaseIsInitialized) {
    admin.initializeApp();
    firebaseIsInitialized = true;
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
export function handleUnsupportedFunction(response: Response) {
  response.status(405).send({ 'errorMessage': 'Method not supported.' });
}