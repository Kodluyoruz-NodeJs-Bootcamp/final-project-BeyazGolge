import User from '../entities/User';
import { Request, Response } from 'express';
import SessionService from '../services/sessionService';

const sessionService = new SessionService();
export async function registerUser(req: Request, res: Response) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      req.flash('error', 'User already exists');
      res.status(400).redirect('/');
      return;
    }

    await sessionService.createUser(
      req.body.name,
      req.body.email,
      req.body.password
    );
    req.flash('success', 'Successfully registered, please login');

    res.status(201).redirect('/');
  } catch ({ message }) {
    req.flash(
      'error',
      'an Error occured while registering, please try again later'
    );
    res.status(400).redirect('/');
  }
}

export async function loginUser(req: Request, res: Response) {
  const hasValidToken = await sessionService.hasValidToken(req.cookies.auth);
  if (hasValidToken) {
    req.flash('error', 'You are already logged in');
    res.status(400).redirect('/');
    return;
  }

  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    req.flash('error', 'You must register first');
    res.status(400).redirect('/');
    return;
  }

  try {
    const token = await sessionService.loginUser(
      req.body.password,
      user?.password!,
      user?.id!
    );
    res.status(201).cookie('auth', token).redirect('/dashboard');
  } catch ({ message }) {
    req.flash('error', `${message}`);
    res.status(400).redirect('/');
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    res.status(200).clearCookie('auth').redirect('/');
  } catch (error) {
    req.flash('error', 'Unable to logout');
    res.status(500).redirect('/');
  }
}

export async function loginWithGoogle(req: Request, res: Response) {
  const code = req.query.code as string;
  const sessionService = new SessionService();
  try {
    const googleUserInfo = await sessionService.getGoogleUser(code);
    let user = await User.findOne({ where: { email: googleUserInfo.email } });
    if (!!user) {
      const token = await sessionService.loginUser(
        googleUserInfo.id,
        user?.password!,
        user?.id!
      );
      res.status(201).cookie('auth', token).redirect('/dashboard');
      return;
    }

    await sessionService.createUser(
      googleUserInfo.name,
      googleUserInfo.email,
      googleUserInfo.id
    );

    user = await User.findOne({ where: { email: googleUserInfo.email } });

    const token = await sessionService.loginUser(
      googleUserInfo.id,
      user?.password!,
      user?.id!
    );

    res.status(201).cookie('auth', token).redirect('/dashboard');
    return;
  } catch (error) {
    req.flash('error', 'An error occured with the google service');
    res.status(500).redirect('/');
  }
}

export async function loginWithFacebook(req: Request, res: Response) {
  const code = req.query.code as string;
  const sessionService = new SessionService();
  const facebookUserInfo = await sessionService.getFacebookUser(code);
  facebookUserInfo.name =
    facebookUserInfo.first_name + ' ' + facebookUserInfo.last_name;
  if (!facebookUserInfo.email) {
    facebookUserInfo.email = facebookUserInfo.id;
  }
  try {
    let user = await User.findOne({ where: { email: facebookUserInfo.email } });
    if (!!user) {
      const token = await sessionService.loginUser(
        facebookUserInfo.id,
        user?.password!,
        user?.id!
      );
      res.status(201).cookie('auth', token).redirect('/dashboard');
      return;
    }

    await sessionService.createUser(
      facebookUserInfo.name,
      facebookUserInfo.email,
      facebookUserInfo.id
    );

    user = await User.findOne({ where: { email: facebookUserInfo.email } });

    const token = await sessionService.loginUser(
      facebookUserInfo.id,
      user?.password!,
      user?.id!
    );

    res.status(201).cookie('auth', token).redirect('/dashboard');
    return;
  } catch (error) {
    req.flash('error', 'There is an error with the facebook service');
    res.status(500).redirect('/');
  }
}
