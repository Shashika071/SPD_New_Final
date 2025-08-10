import { deleteTeacher, getTeacherById, getTeachers, loginTeacher, registerTeacher, updateProfileImage } from "../controllers/teacherController.js";

import authMiddleware from "../middleware/auth.js";
import express from "express";
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const supervisorsRouter = express.Router();

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
supervisorsRouter.post("/register", registerTeacher);
supervisorsRouter.post("/login", loginTeacher);
supervisorsRouter.post("/delete", authMiddleware, deleteTeacher);
supervisorsRouter.get("/get_guides", getTeachers);
supervisorsRouter.get("/get_guide", authMiddleware, getTeacherById);
supervisorsRouter.post('/update', authMiddleware, upload.single('profile_image'), updateProfileImage);

export default supervisorsRouter;
