import express from 'express';
const router = express.Router();
import * as homeController from '../controllers/homeController';
import auth from '../middlewares/auth';

router.route('/').get(homeController.getIndexPage);
router.route('/dashboard').get(auth, homeController.getDashboardPage);

export default router;
