import { Request, Response, NextFunction } from 'express';
import SessionService from '../services/sessionService';

const sessionService = new SessionService();
const auth = async (req: Request, res: Response, next: NextFunction) => {
  const hasValidToken = await sessionService.hasValidToken(req.cookies.auth);
  if (!hasValidToken) {
    req.flash('error', 'You must login or register first');
    res.redirect('/');
    return;
  } else {
    next();
  }
};

export default auth;
