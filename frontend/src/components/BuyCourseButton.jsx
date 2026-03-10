import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useEnrollCourseMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BuyCourseButton = ({ courseId }) => {
  const navigate = useNavigate();
  const [enrollCourse, { isLoading, isSuccess, isError, error }] =
    useEnrollCourseMutation();

  const purchaseCourseHandler = async () => {
    await enrollCourse(courseId);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Enrolled successfully! Redirecting to course...");
      navigate(`/course-progress/${courseId}`);
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to enroll in course");
    }
  }, [isSuccess, isError, error, courseId, navigate]);

  return (
    <Button disabled={isLoading} onClick={purchaseCourseHandler} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Enroll Now"
      )}
    </Button>
  );
};

export default BuyCourseButton;