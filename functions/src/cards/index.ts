import { Request, Response } from 'express';

/** 
 * Handle the /cards endpoint.
*/
export function handleCards(request: Request, response: Response) {
  response.sendStatus(200);
}
