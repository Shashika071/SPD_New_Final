import {
  attemptQuiz,
  getAllClassResources,
  getAssignment,
  getAssignmentQuestions,
  getClassResources,
  getQuestion,
  submitAssignment,
  submitQuestionAnswer,
  viewQuestion
} from '../controllers/studentResourceController.js';
import {
  completeEnrollment,
  enrollInClass,
  getAvailableClasses,
  getMyClasses
} from '../controllers/studentClassController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const studentReandClassRouter = express.Router();

// Class enrollment routes
studentReandClassRouter.get('/classes/available', authMiddleware, getAvailableClasses);
studentReandClassRouter.post('/enrollments', authMiddleware, enrollInClass);
studentReandClassRouter.post('/enrollments/:enrollmentId/complete', authMiddleware, completeEnrollment);
studentReandClassRouter.get('/enrollments/my-classes', authMiddleware, getMyClasses);

studentReandClassRouter.get('/class/:class_id/resources', authMiddleware, getClassResources);
studentReandClassRouter.get('/class/resources_all', authMiddleware, getAllClassResources);

// Assignment routes
studentReandClassRouter.get('/assignments/:assignmentId', authMiddleware, getAssignment);
studentReandClassRouter.get('/assignments/:assignmentId/questions', authMiddleware, getAssignmentQuestions);
studentReandClassRouter.post('/assignments/submit', 
  authMiddleware, 
  upload.single('document'), 
  submitAssignment
);

// Quiz routes
studentReandClassRouter.post('/quizzes/attempt', authMiddleware, attemptQuiz);

// Question routes
studentReandClassRouter.get('/questions/:questionId', authMiddleware, getQuestion);
studentReandClassRouter.post('/questions/:questionId/answer', authMiddleware, submitQuestionAnswer);
studentReandClassRouter.get('/questions/:questionId/view', authMiddleware,viewQuestion);
 
export default studentReandClassRouter;