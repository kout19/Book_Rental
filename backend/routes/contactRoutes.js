import {submitContact} from '../controllers/contactController.js';
import express from 'express';
const router = express.Router();

router.post('/', submitContact);
export default router;