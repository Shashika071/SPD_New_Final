import {
  addPastPaper,
  addQuestion,
  addVideo,
  createAssignment,
  deleteAssignment,
  deletePastPaper,
  deleteQuestion,
  deleteVideo,
  getAssignmentSubmissions,
  getClassResource,
  getQuestionAnswers,
  getStudentEnrollments,
  getTeacherStudents,
  updateStudentAnswer,
  updateStudentSubmission
} from '../controllers/resourcesController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const resourcesRouter = express.Router();

// All routes protected by authMiddleware
resourcesRouter.post('/questions', authMiddleware, addQuestion);
resourcesRouter.post('/assignments', authMiddleware, createAssignment);
resourcesRouter.post('/past-papers', authMiddleware, addPastPaper);
resourcesRouter.post('/videos', authMiddleware, addVideo);
resourcesRouter.get('/classes/:class_id/resources', authMiddleware, getClassResource);
resourcesRouter.delete('/questions/:question_id', authMiddleware, deleteQuestion);
resourcesRouter.delete('/assignments/:assignment_id', authMiddleware, deleteAssignment);
resourcesRouter.delete('/past-papers/delete', authMiddleware, deletePastPaper);
resourcesRouter.delete('/videos/:video_id', authMiddleware, deleteVideo);

// Teacher-student management routes
resourcesRouter.get('/teacher/students', authMiddleware, getTeacherStudents);
resourcesRouter.put('/submissions/:submission_id', authMiddleware, updateStudentSubmission);
resourcesRouter.put('/answers/:answer_id', authMiddleware, updateStudentAnswer);
resourcesRouter.get('/assignments/:assignment_id/submissions', authMiddleware, getAssignmentSubmissions);
resourcesRouter.get('/questions/:question_id/answers', authMiddleware, getQuestionAnswers);
resourcesRouter.get('/students/:student_id/enrollments', authMiddleware, getStudentEnrollments);

export default resourcesRouter;