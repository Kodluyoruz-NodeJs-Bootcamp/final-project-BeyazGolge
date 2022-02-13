import express from 'express';
import auth from '../middlewares/auth';
import * as sessionController from '../controllers/sessionController';

const router = express.Router();

router.route('/login').post(sessionController.loginUser);
router.route('/logout').get(auth, sessionController.logoutUser);
router.route('/register').post(sessionController.registerUser);

router.route('/google').get(sessionController.loginWithGoogle);
router.route('/facebook').get(sessionController.loginWithFacebook);

export default router;
