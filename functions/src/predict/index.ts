import { Request, Response } from 'express';

/**
 * 
 * @param {Request} request The request to handle
 * @param {Response} response The response to handle
 */
export function handlePrediction(request: Request, response: Response) {
  response.sendStatus(200);
}