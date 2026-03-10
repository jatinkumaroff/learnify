import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const  userId  = req.id;

        //step 1 user course progress
        let courseProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId");

        const courseDetails = await Course.findById(courseId).populate("lectures");
        if (!courseDetails) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        // step 2 if no progress found , return course details with an empty progress
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                }
            })
        }

        //step 3 return course progress of useralong with details of course
        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to get course progress" });
    }
}
export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        let courseProgress = await CourseProgress.findOne({ courseId, userId })
        if (!courseProgress) {
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: [],
            })
        }

        // find the lecture progress in the course

        const lectureIndex = courseProgress.lectureProgress.findIndex((lecture) => lecture.lectureId === lectureId)
        if (lectureIndex !== -1) {
            courseProgress.lectureProgress[lectureIndex].viewed = true
        } else {
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true
            })
        }

        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg) => lectureProg.viewed).length

        const course = await Course.findById(courseId)
        if (course.lectures.length === lectureProgressLength) {
            courseProgress.completed = true;
        }
        await courseProgress.save();

        return res.status(200).json({
            message: "lecture progress updated successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update lecture progress" });
    }
}

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) return res.status(404).json({ message: "Course progress not found" });

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = true)
        );
        courseProgress.completed = true;
        await courseProgress.save();
        return res.status(200).json({ message: "Course marked as completed." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to mark course as completed" });
    }
};

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress)
            return res.status(404).json({ message: "Course progress not found" });

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = false)
        );
        courseProgress.completed = false;
        await courseProgress.save();
        return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to mark course as incomplete" });
    }
};

export const toggleLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      // No progress record yet — create one with this lecture marked viewed
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [{ lectureId, viewed: true }],
      });
      await courseProgress.save();
      return res.status(200).json({ message: "Lecture marked as viewed", viewed: true });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lp) => lp.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      // Flip the current viewed state
      const current = courseProgress.lectureProgress[lectureIndex].viewed;
      courseProgress.lectureProgress[lectureIndex].viewed = !current;
    } else {
      // Not tracked yet — mark as viewed
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }

    // Recalculate course completion
    const course = await Course.findById(courseId);
    const viewedCount = courseProgress.lectureProgress.filter((lp) => lp.viewed).length;
    courseProgress.completed = course && viewedCount === course.lectures.length;

    await courseProgress.save();

    const newState = courseProgress.lectureProgress.find((lp) => lp.lectureId === lectureId)?.viewed ?? false;
    return res.status(200).json({ message: "Lecture progress toggled", viewed: newState });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to toggle lecture progress" });
  }
};