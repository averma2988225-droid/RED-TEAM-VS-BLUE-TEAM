import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { submitScan, getScans, getScan } from '../controllers/scanController';

const router = Router();
router.use(authenticate);

router.post('/',
  [
    body('code').notEmpty().withMessage('Code is required'),
    body('language').isIn(['javascript', 'typescript', 'python', 'java', 'php', 'go', 'ruby', 'c', 'cpp'])
      .withMessage('Unsupported language'),
  ],
  submitScan
);

router.get('/', getScans);
router.get('/:id', getScan);

export default router;
