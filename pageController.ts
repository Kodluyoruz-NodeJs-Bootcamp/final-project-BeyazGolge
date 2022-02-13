import { Request, Response } from 'express';

export async function getIndexPage(req: Request, res: Response) {
  let userIN: boolean = false;
  if (!!req.cookies.auth) {
    userIN = true;
  }
  res.status(200).render('index', {
    userIN,
  });
}
