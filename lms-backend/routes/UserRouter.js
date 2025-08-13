import { deleteStudent, getAssignmentDetails, getQuestionDetails, getStudentAssignments, getStudentById, getStudentQuestions, getStudents, loginStudent, registerStudent, updateProfileImage } from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";
import express from "express";
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const userRouter = express.Router();

// Set up multer for file upload
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Define routes
userRouter.post("/register", registerStudent);
userRouter.post("/login", loginStudent);
userRouter.post("/delete", authMiddleware, deleteStudent);
userRouter.get("/get_users", getStudents);
userRouter.get("/get_user", authMiddleware, getStudentById);
userRouter.post('/update', authMiddleware, upload.single('profile_image'), updateProfileImage);


userRouter.get("/assignments", authMiddleware, getStudentAssignments);
userRouter.get("/assignments/get_id", authMiddleware, getAssignmentDetails);

// Question routes (protected)
userRouter.get("/questions", authMiddleware, getStudentQuestions);
userRouter.get("/questions/get_id", authMiddleware, getQuestionDetails);
export default userRouter;
