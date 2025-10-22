import { Router } from 'express';
import { FaqController } from '../controllers/faq.controller';

const router = Router();

// FAQ routes with simplified class-based controller
router.post('/addfaq', FaqController.createFaq);
router.get('/listfaq', FaqController.getAllFaqs);
router.get('/getFaq/:id', FaqController.getFaqById);
router.put('/updatefaq/:id', FaqController.updateFaq);
router.delete('/deletefaq/:id', FaqController.deleteFaq);
router.patch('/togglestatus/:id', FaqController.toggleFaqStatus);
router.post('/check-duplicate', FaqController.checkDuplicateFaq);

export default router;