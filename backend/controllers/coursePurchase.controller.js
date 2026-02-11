import Stripe from 'stripe';
import { Course } from "../models/course.model.js"
import { CoursePurchase } from "../models/purchaseCourse.model.js"
import { User } from '../models/user.model.js';
import { Lecture } from '../models/lecture.model.js';

const STRIPE_SECRET_KEY = "";
const WEBHOOK_ENDPOINT_SECRET = "";

let stripeClient = null;

const getStripeClient = () => {
    if (stripeClient) {
        return stripeClient;
    }
    if (!STRIPE_SECRET_KEY) {
        return null;
    }
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
    return stripeClient;
};

export const createCheckoutSession = async (req, res) => {
    try {
        const stripe = getStripeClient();
        if (!stripe) {
            return res.status(503).json({
                success: false,
                message: "Stripe is not configured. Update STRIPE_SECRET_KEY in backend/controllers/coursePurchase.controller.js",
            });
        }

        const userId = req.id;
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }

        const newPurchase = new CoursePurchase({
            courseId,
            userId,
            amount: course.coursePrice,
            status: "pending"
        })

        //create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.courseTitle,
                            images: [course.courseThumbnail],
                        },
                        unit_amount: course.coursePrice * 100, // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
            cancel_url: `http://localhost:5173/course-detail/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: userId,
            },
            shipping_address_collection: {
                allowed_countries: ["IN"], // Optionally restrict allowed countries
            },
        });

        if (!session.url) {
            return res.status(400).json({
                success: false,
                message: "Error while creating session" 
            });
        }

        // Save the purchase record
        newPurchase.paymentId = session.id;
        await newPurchase.save();

        return res.status(200).json({
            success: true,
            url: session.url, // Return the Stripe checkout URL
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create checkout session",
        });
    }
}
export const stripeWebhook = async (req, res) => {
  let event;
  const stripe = getStripeClient();

  if (!stripe) {
    return res.status(503).json({
      message: "Stripe is not configured. Update STRIPE_SECRET_KEY in backend/controllers/coursePurchase.controller.js",
    });
  }

  try {
    const secret = WEBHOOK_ENDPOINT_SECRET;
    const signature = req.headers["stripe-signature"];
    if (!secret || !signature) {
      return res.status(400).json({
        message: "Missing Stripe webhook secret/signature",
      });
    }
    event = stripe.webhooks.constructEvent(req.body, signature, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};
export const getCourseDetailWithPurchaseStatus = async(req,res)=>{
  try {
    const {courseId} = req.params;
    const userId = req.id;
    const course = await Course.findById(courseId).populate({path:"creator"}).populate({path:"lectures"});

    const purchased = await CoursePurchase.findOne({userId,courseId});
    if(!course){
      return res.status(404).json({
        message:"course not found"
      })
    }
    res.status(200).json({
      course,
      purchased: purchased ? true : false
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course detail",
    });
  }
}
export const getAllPurchasedCourse = async(req,res)=>{
  try {
    const userId = req.id;
    const purchasedCourses = await CoursePurchase.find({
      status: "completed",
      userId,
    }).populate("courseId");
    res.status(200).json({
      purchasedCourses
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get purchased courses",
    });
  }
}
