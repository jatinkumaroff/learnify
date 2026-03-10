import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  enrollCourse,
  getCourseDetailWithPurchaseStatus,
  getAllPurchasedCourse,
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// Instant enroll (replaces Stripe checkout)
router.post("/enroll", isAuthenticated, enrollCourse);

// Course detail + purchase status (used by CourseDetail page & PurchaseCourseProtectedRoute)
router.get("/course/:courseId/detail-with-status", isAuthenticated, getCourseDetailWithPurchaseStatus);

// All purchases for instructor dashboard
router.get("/", isAuthenticated, getAllPurchasedCourse);

export default router;