import express from 'express';
const router = express.Router();
import * as searchController from '../controllers/searchController';
import auth from '../middlewares/auth';

router.route('/films').post(auth, searchController.searchFilm);
router.route('/actors').post(auth, searchController.searchActor);

export default router;
