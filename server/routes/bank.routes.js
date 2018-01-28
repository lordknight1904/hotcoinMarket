import { Router } from 'express';
import * as BankController from '../controllers/bank.controller';
const router = new Router();

router.route('/bank').get(BankController.getBank);
router.route('*');

export default router;
