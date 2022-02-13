import { Request, Response } from 'express';
import Film from '../entities/Film';
import Actor from '../entities/Actor';
import SessionService from '../services/sessionService';

const sessionService = new SessionService();

export async function getIndexPage(req: Request, res: Response) {
  let userIN: boolean = false;
  if (!!req.cookies.auth) {
    userIN = true;
  }
  const getGoogleOAuthURL = await sessionService.getGoogleOAuthURL();
  const getFacebookOAuthURL = await sessionService.getFacebookOAuthURL();
  res.status(200).render('index', {
    userIN,
    getGoogleOAuthURL,
    getFacebookOAuthURL,
  });
}

export async function getDashboardPage(req: Request, res: Response) {
  const token = req.cookies.auth;
  const user = await sessionService.findByTokenWithRelations(token);
  const posts = user?.posts;
  const filmPosts = [];
  const actorPosts = [];

  for (const post of posts!) {
    if (post.entityType === 'Film') {
      filmPosts.push(post);
    } else {
      actorPosts.push(post);
    }
  }

  const filmCards = [];
  const actorCards = [];
  for (const filmPost of filmPosts) {
    const film = await Film.findOne(filmPost.entityId);
    const image = film?.image;
    const filmName = film?.name;
    const postID = filmPost.id;
    const isPublic = filmPost.public;
    filmCards.push({ postID, filmName, image, isPublic });
  }
  for (const actorPost of actorPosts) {
    const actor = await Actor.findOne(actorPost.entityId);
    const image = actor?.image;
    const actorName = actor?.name;
    const postID = actorPost.id;
    const isPublic = actorPost.public;
    actorCards.push({ postID, actorName, image, isPublic });
  }
  res.status(200).render('dashboard', {
    name: user!.name,
    filmCards,
    actorCards,
  });
}
