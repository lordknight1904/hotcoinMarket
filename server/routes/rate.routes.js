import { Router } from 'express';
import * as RateController from '../controllers/rate.controller';
const router = new Router();

router.route('/rate/:coin').get(RateController.getRate);

export default router;
