import { Router } from 'express';
import * as SettingController from '../controllers/setting.controller';
const router = new Router();

router.route('/setting').get(SettingController.getSetting);

export default router;
