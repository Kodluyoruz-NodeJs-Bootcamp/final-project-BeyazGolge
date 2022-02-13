import { Request, Response } from 'express';
import Film from '../entities/Film';
import Post from '../entities/Post';
import Liked from '../entities/Liked';
import Comment from '../entities/Comment';
import Actor from '../entities/Actor';
import SessionService from '../services/sessionService';

const sessionService = new SessionService();

export async function getCommunityFavorites(req: Request, res: Response) {
  const filmCards = [];
  const actorCards = [];
  const token = req.cookies.auth;
  const user = await sessionService.findByTokenWithRelations(token);
  const likes = await Liked.find({ relations: ['user', 'post'] });
  const usersLikesIDs = [];
  for (const item of likes!) {
    if (item.user?.id === user?.id) {
      usersLikesIDs.push(item.post?.id);
    }
  }
  try {
    const publicFilmPosts = await Post.find({
      where: { public: true, entityType: 'Film' },
      relations: ['user', 'likes', 'comments'],
    });

    for (const item of publicFilmPosts) {
      const film = await Film.findOne(item.entityId);
      const filmName = film?.name;
      const filmImage = film?.image;
      const sharedBy = item.user?.name;
      const postID = item.id;
      const likeCount = item.likes?.length;
      const userID = item.user?.id;
      filmCards.push({
        filmName,
        filmImage,
        sharedBy,
        postID,
        userID,
        likeCount,
      });
    }

    const publicActorPosts = await Post.find({
      where: { public: true, entityType: 'Actor' },
      relations: ['user', 'likes', 'comments'],
    });

    for (const item of publicActorPosts) {
      const actor = await Actor.findOne(item.entityId);
      const actorName = actor?.name;
      const actorImage = actor?.image;
      const sharedBy = item.user?.name;
      const postID = item.id;
      const likeCount = item.likes?.length;
      const userID = item.user?.id;
      actorCards.push({
        actorName,
        actorImage,
        sharedBy,
        postID,
        userID,
        likeCount,
      });
    }
  } catch (error) {
    req.flash('error', 'An error occured while getting the posts');
    res.status(400).redirect('/');
  }
  res
    .status(200)
    .render('communityFavorites', { filmCards, usersLikesIDs, actorCards });
}

export async function addFilmToFavorites(req: Request, res: Response) {
  const token = req.cookies.auth;
  const user = await sessionService.findByTokenWithRelations(token);
  const userPosts = user?.posts;
  let film = await Film.findOne({
    where: { name: req.body.name },
  });
  if (!film) {
    film = new Film();
    film.name = req.body.name;
    film.image = req.body.image;
    await film.save();
  }
  try {
    for (const item of userPosts!) {
      if (item.entityId.toString() === film.id.toString()) {
        res.status(201).redirect('/dashboard');
      }
    }
    const post = new Post();
    post.public = false;
    post.entityId = film!.id;
    post.entityType = film!.constructor.name;
    post.user = user!;
    await post.save();
    res.status(201).redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'An error occured while adding a film to favorites');
    res.status(400).redirect('/');
  }
}

export async function addActorToFavorites(req: Request, res: Response) {
  const token = req.cookies.auth;
  const user = await sessionService.findByTokenWithRelations(token);

  const userPosts = user?.posts;
  let actor = await Actor.findOne({
    where: { name: req.body.name },
  });
  if (!actor) {
    actor = new Actor();
    actor.name = req.body.name;
    actor.image = req.body.image;
    await actor.save();
  }
  try {
    for (const item of userPosts!) {
      if (item.entityId.toString() === actor.id!.toString()) {
        res.status(201).redirect('/dashboard');
      }
    }
    const post = new Post();
    post.public = false;
    post.entityId = actor!.id!;
    post.entityType = actor!.constructor.name;
    post.user = user!;
    await post.save();
    res.status(201).redirect('/dashboard');
    return;
  } catch (error) {
    req.flash('error', 'An error occured while adding a actor to favorites');
    res.status(400).redirect('/');
    return;
  }
}

export async function makePostPublic(req: Request, res: Response) {
  const postID = req.params.postID;
  try {
    const post = await Post.findOne(postID);
    post!.public = !post!.public;
    await post!.save();
  } catch (error) {
    req.flash('error', 'An error occured while making post public');
    res.status(400).redirect('/');
  }

  res.status(200).redirect('/dashboard');
}

export async function likePost(req: Request, res: Response) {
  const postID = req.params.postID;
  const token = req.cookies.auth;
  const user = await sessionService.findByTokenWithRelations(token);

  const post = await Post.findOne(postID, { relations: ['likes'] });
  const likes = await Liked.find({ relations: ['user', 'post'] });
  let likeToDeleteID = '';
  for (const item of likes) {
    if (item.user?.id === user!.id && item.post?.id === post!.id) {
      likeToDeleteID = item.id!;
    }
  }
  if (likeToDeleteID) {
    await Liked.delete(likeToDeleteID);
    res.status(200).redirect('/posts');
  } else {
    const like = new Liked();
    like.Liked = true;
    like.user = user!;
    like.post = post!;
    await like.save();
    res.status(200).redirect('/posts');
  }
}

export async function getPost(req: Request, res: Response) {
  const postID = req.params.postID;
  const comments = await Comment.find({ relations: ['user', 'post'] });
  const post = await Post.findOne(postID, { relations: ['user'] });
  const favoritedEntry = await post?.owner();
  const postsComments = [];
  for (const comment of comments) {
    if (comment.post?.id!.toString() === postID!.toString()) {
      postsComments.push({
        commenter: comment.user?.name,
        comment: comment.comment,
      });
    }
  }
  res.status(200).render('postComments', {
    postsComments,
    postID: post?.id,
    postImage: favoritedEntry?.image,
    postTitle: favoritedEntry?.name,
    postedBy: post?.user?.name,
  });
}

export async function postComment(req: Request, res: Response) {
  const postID = req.params.postID;
  const token = req.cookies.auth;
  const post = await Post.findOne(postID);
  const user = await sessionService.findByTokenWithRelations(token);

  const comment = new Comment();
  comment.comment = req.body.comment;
  comment.post = post!;
  comment.user = user!;
  await comment.save();
  res.status(201).redirect(`/posts/${postID}/comments`);
}
