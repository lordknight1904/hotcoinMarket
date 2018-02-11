import { Router } from 'express';
import * as MarketOrderController from '../controllers/marketOrder.controller';
const router = new Router();

router.route('/market/first').post(MarketOrderController.first);
router.route('/market/second').post(MarketOrderController.second);
router.route('/market/third').post(MarketOrderController.third);
router.route('/market/done').post(MarketOrderController.done);
router.route('/market/send').post(MarketOrderController.send);
router.route('/market').post(MarketOrderController.createMarketOrder);
// router.route('/market/fee').post(MarketOrderController.fee);
router.route('/market').delete(MarketOrderController.deleteOrder);
router.route('/market/:coin/:type').get(MarketOrderController.getMarket);
router.route('/market/open/:coin/:userName/:type').get(MarketOrderController.getMyMarket);
router.route('/market/trading/:coin/:userName').get(MarketOrderController.getMyTradingMarket);
router.route('/marketlatest/:coin').get(MarketOrderController.getLatestRate);
router.route('/history/:userName/:coin/:currentPage').get(MarketOrderController.getHistory);

export default router;
