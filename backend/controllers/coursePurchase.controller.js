import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/purchaseCourse.model.js";
import { User } from "../models/user.model.js";

// POST /api/v1/purchase/enroll
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Check if already enrolled
    const existing = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    // Create completed purchase record instantly
    await CoursePurchase.create({
      courseId,
      userId,
      amount: course.coursePrice || 0,
      status: "completed",
    });

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true },
    );

    // Add user to course's enrolledStudents
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course",
    });
  } catch (error) {
    console.error("enrollCourse error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to enroll in course" });
  }
};

// GET /api/v1/purchase/course/:courseId/detail-with-status
export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator", select: "name photoUrl" })
      .populate({ path: "lectures" });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      course,
      purchased: !!purchase,
    });
  } catch (error) {
    console.error("getCourseDetailWithPurchaseStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get course details" });
  }
};

// GET /api/v1/purchase/
// Returns completed purchases for courses created by the logged-in instructor
export const getAllPurchasedCourse = async (req, res) => {
  try {
    const instructorId = req.id;

    const instructorCourses = await Course.find({
      creator: instructorId,
    }).select("_id");
    const courseIds = instructorCourses.map((c) => c._id);

    const purchasedCourses = await CoursePurchase.find({
      courseId: { $in: courseIds },
      status: "completed",
    }).populate("courseId");

    return res.status(200).json({
      success: true,
      purchasedCourses,
    });
  } catch (error) {
    console.error("getAllPurchasedCourse error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get purchased courses" });
  }
};
