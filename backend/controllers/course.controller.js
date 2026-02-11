import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js"

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category is required",
                success: false
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id,

        });
        return res.status(201).json({
            course,
            message: "Course created",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Failed to create course",
            success: false,
        })
    }
}
export const searchCourse = async (req,res) => {
    try {
        const {query = "", categories = "", sortByPrice =""} = req.query;

        const categoryList = Array.isArray(categories)
            ? categories
            : String(categories)
                .split(",")
                .map((category) => category.trim())
                .filter(Boolean);
        
        // create search query
        const searchCriteria = {
            isPublished:true,
            $or:[
                {courseTitle: {$regex:query, $options:"i"}},
                {subTitle: {$regex:query, $options:"i"}},
                {category: {$regex:query, $options:"i"}},
            ]
        }

        // if categories selected
        if(categoryList.length > 0) {
            searchCriteria.category = {$in: categoryList};
        }

        // define sorting order
        const sortOptions = {};
        if(sortByPrice === "low"){
            sortOptions.coursePrice = 1;//sort by price in ascending
        }else if(sortByPrice === "high"){
            sortOptions.coursePrice = -1; // descending
        }

        let courses = await Course.find(searchCriteria).populate({path:"creator", select:"name photoUrl"}).sort(sortOptions);

        return res.status(200).json({
            success:true,
            courses: courses || []
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to search courses",
        });
    }
}
export const getPublishedCourses = async (_, res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate({path:"creator", select:"name photoUrl"});
        if (!courses) {
            return res.status(404).json({
                message: "courses not found",
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get published courses",
        })
    }
}
export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({ creator: userId });

        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course not found",

            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get courses",
            success: false,
        })
    }
}
export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course Not Found",
                success: false
            })
        }
        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
                await deleteMediaFromCloudinary(publicId);//delete old image
            }
            courseThumbnail = await uploadMedia(thumbnail.path);
            if (!courseThumbnail?.secure_url) {
                return res.status(500).json({
                    message: "Cloudinary is not configured. Update backend/utils/cloudinary.js",
                    success: false,
                });
            }
        }

        //updated data 
        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url }
        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        return res.status(200).json({
            message: "Course updated Successfully",
            success: true,
            course
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to edit course",
            success: false,
        })
    }
}
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "course not found",

            })
        }
        return res.status(200).json({
            course,
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to get course",
            success: false,
        })
    }
}
export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "lecture title is required",
                success: false,
            })
        }
        const lecture = await Lecture.create({ lectureTitle });
        const course = await Course.findById(courseId);
        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message: "Lecture added successully",
            success: true,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course",
        })
    }
}
export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "course not found",
            })
        }
        return res.status(200).json({
            lectures: course.lectures,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course",
        })
    }
}
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "lecture not found"
            })
        }
        //update lecture
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;
        await lecture.save();

        const course = await Course.findById(courseId);
        if(course && !course.lectures.includes(lecture._id)){
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            lecture,
            message:"lecture updated successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to edit lecture",
        })
    }
}
export const removeLecture = async (req, res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "lecture not found",
            });
        }

        //delete lecture from cloudinary as well
        if(lecture.publicId){
            await deleteVideoFromCloudinary(lecture.publicId);
        }
        // remove lecture from associated course
        await Course.updateOne(
            {lectures:lectureId},
            {$pull:{lectures:lectureId}}
        )
        return res.status(200).json({
            message:"lecture removed successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove lecture",
        })
    }
}
export const getLectureById = async (req, res) => {
    try {
        const {lectureId} = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "lecture not found"
            })
        }
        return res.status(200).json({
            lecture
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lecture",
        })
    }
}
export const togglePublish = async(req,res)=>{
    try {
        const {courseId} = req.params;
        const {publish} = req.query;
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                message:"course not found"
            })
        }
        course.isPublished = publish === "true";
        await course.save();
        const statusMessage = course.isPublished ? "Published" : "UnPublished";
        return res.status(200).json({
            message:`Course is ${statusMessage}`
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status",
        })
    }
}

