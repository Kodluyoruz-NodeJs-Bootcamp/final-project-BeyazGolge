import express from 'express';
const router = express.Router();
import * as postController from '../controllers/postController';
import auth from '../middlewares/auth';

router.route('/').get(auth, postController.getCommunityFavorites);
router.route('/:postID/likes').get(auth, postController.likePost);
router.route('/:postID/comments').get(auth, postController.getPost);
router.route('/:postID/comments').post(auth, postController.postComment);
router
  .route('/addFilmToFavorites')
  .post(auth, postController.addFilmToFavorites);
router
  .route('/addActorToFavorites')
  .post(auth, postController.addActorToFavorites);
router
  .route('/:postID/makePostPublic')
  .get(auth, postController.makePostPublic);

export default router;
