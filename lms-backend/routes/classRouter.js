import {
  createClass,
  deleteClass,
  getClasses,
  updateClass
} from '../controllers/classController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const ClassRouter = express.Router();

// Class routes - all protected by authMiddleware
ClassRouter.post('/classes', authMiddleware, createClass);
ClassRouter.get('/classes/teacher', authMiddleware, getClasses); // Changed from /teacher/:teacherId
ClassRouter.put('/classes/:id', authMiddleware, updateClass);
ClassRouter.delete('/classes/:id', authMiddleware, deleteClass);

export default ClassRouter;