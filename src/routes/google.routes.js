import express from 'express';
import googleController from '../controllers/google.controller.js'; 

const router = express.Router();

router.post('/google', googleController.googleLogin);

export default router;
