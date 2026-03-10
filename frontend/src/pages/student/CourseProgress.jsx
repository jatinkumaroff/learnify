import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useToggleLectureProgressMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;

  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [toggleLectureProgress] = useToggleLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();

  const [currentLecture, setCurrentLecture] = useState(null);

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData?.message || "Course marked as completed.");
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData?.message || "Course marked as incomplete.");
    }
  }, [completedSuccess, inCompletedSuccess]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const activeLecture = currentLecture || courseDetails.lectures?.[0];

  const isLectureCompleted = (lectureId) =>
    progress.some((p) => p.lectureId === lectureId && p.viewed);

  // Selecting a lecture only changes which video is shown — zero API calls
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
  };

  // Clicking the icon toggles completion state via API
  const handleToggleComplete = async (e, lecture) => {
    e.stopPropagation();
    await toggleLectureProgress({ courseId, lectureId: lecture._id });
    refetch();
  };

  // Video finishing auto-marks it viewed
  const handleVideoEnd = async () => {
    if (!activeLecture?._id) return;
    await updateLectureProgress({ courseId, lectureId: activeLecture._id });
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed
            ? async () => { await inCompleteCourse(courseId); }
            : async () => { await completeCourse(courseId); }}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed</span>
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video player */}
        <div className="flex-1 md:w-3/5 rounded-lg shadow-lg p-4">
          {/*
            IMPORTANT — why native <video> not ReactPlayer:
            ReactPlayer renders at 0px when height="100%" is inside a parent
            whose height comes only from aspect-ratio (not an explicit px value).

            IMPORTANT — why key={activeLecture._id}:
            Without the key, changing src on an existing <video> while a fetch
            is in progress aborts it. The key forces a fresh DOM element per
            lecture so there is never a mid-load src swap.

            IMPORTANT — onError suppresses code 1 (MEDIA_ERR_ABORTED):
            React StrictMode in development intentionally mounts → unmounts →
            remounts every component. The first unmount kills the in-flight
            video fetch, producing a harmless MEDIA_ERR_ABORTED (code 1) in the
            console. We silence it to avoid confusion; real errors (code 2-4)
            are still logged.
          */}
          <div
            className="w-full bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: "16 / 9" }}
          >
            {activeLecture?.videoUrl ? (
              <video
                key={activeLecture._id}
                src={activeLecture.videoUrl}
                controls
                className="w-full h-full"
                onEnded={handleVideoEnd}
                onError={(e) => {
                  if (e.target.error?.code !== MediaError.MEDIA_ERR_ABORTED) {
                    console.error("Video load error:", e.target.error);
                    toast.error("Could not load video. Please try again.");
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm text-center px-4">
                  No video for this lecture yet.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex((l) => l._id === activeLecture?._id) + 1
              } : ${activeLecture?.lectureTitle}`}
            </h3>
          </div>
        </div>

        {/* Lecture sidebar */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-1">Course Lectures</h2>
          <p className="text-xs text-gray-400 mb-4">
            Click a lecture to play it. Click the icon to toggle completion.
          </p>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture) => {
              const done = isLectureCompleted(lecture._id);
              const isActive = activeLecture?._id === lecture._id;
              return (
                <Card
                  key={lecture._id}
                  className={`mb-3 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-gray-200 dark:bg-gray-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleComplete(e, lecture)}
                        className="shrink-0 focus:outline-none"
                        title={done ? "Mark incomplete" : "Mark complete"}
                      >
                        {done ? (
                          <CheckCircle2 size={22} className="text-green-500" />
                        ) : (
                          <CirclePlay size={22} className="text-gray-400" />
                        )}
                      </button>
                      <CardTitle className="text-base font-medium leading-snug">
                        {lecture?.lectureTitle}
                      </CardTitle>
                    </div>
                    {done && (
                      <Badge variant="outline" className="bg-green-100 text-green-600 shrink-0 ml-2">
                        Done
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;