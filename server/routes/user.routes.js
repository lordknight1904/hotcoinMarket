import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
const router = new Router();

router.route('/user/create').post(UserController.createUser);
router.route('/user/login').post(UserController.loginUser);
router.route('/user/google/activate').post(UserController.confirmGoogleAuth);
router.route('/user/google/authorize').post(UserController.googleFactor);
router.route('/user/google/cancel').post(UserController.cancelGoogleFactor);
router.route('/user/balance/:userName/:coin').get(UserController.getBalance);
router.route('*');

export default router;