import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getCourseProgress, markAsCompleted, markAsInCompleted, updateLectureProgress, toggleLectureProgress } from "../controllers/courseProgress.controller.js";

const router = express.Router()

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);
router.route("/:courseId/lecture/:lectureId/toggle").post(isAuthenticated, toggleLectureProgress);
router.route("/:courseId/complete").post(isAuthenticated, markAsCompleted);
router.route("/:courseId/incomplete").post(isAuthenticated, markAsInCompleted);

export default router;