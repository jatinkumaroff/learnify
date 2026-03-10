import BuyCourseButton from '@/components/BuyCourseButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetCourseDetailWithStatusQuery } from '@/features/api/purchaseApi'
import { BadgeInfo, PlayCircle } from 'lucide-react'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const CourseDetail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.courseId;

  const { data, isLoading, isError } = useGetCourseDetailWithStatusQuery(courseId);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Failed to load course details</h1>;

  const { course, purchased } = data;
  if (!course) return null;

  const handleContinueCourse = () => {
    navigate(`/course-progress/${courseId}`);
  };

  return (
    <div className='space-y-5'>
      {/* Header banner */}
      <div className='bg-[#2D2F31] text-white'>
        <div className='max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2'>
          <h1 className='font-bold text-2xl md:text-3xl'>{course?.courseTitle}</h1>
          <p className='text-base md:text-lg'>{course?.subTitle}</p>
          <p>
            Created by{' '}
            <span className='text-[#C0C4FC] underline italic'>
              {course?.creator?.name || 'Unknown Instructor'}
            </span>
          </p>
          <div className='flex items-center gap-2 text-sm'>
            <BadgeInfo size={16} />
            <p>Last updated: {course?.updatedAt?.split('T')[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
        </div>
      </div>

      {/* Body */}
      <div className='max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10'>

        {/* Left — description + lecture list */}
        <div className='w-full lg:w-1/2 space-y-5'>
          <h1 className='font-bold text-xl md:text-2xl'>Description</h1>
          <p
            className='text-sm'
            dangerouslySetInnerHTML={{ __html: course?.description || '' }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>{course?.lectures?.length || 0} lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course?.lectures?.map((lecture, idx) => (
                <div key={idx} className='flex items-center gap-3 text-sm'>
                  <PlayCircle size={14} />
                  <p>{lecture?.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right — price + action button only, no video */}
        <div className='w-full lg:w-1/3'>
          <Card>
            <CardContent className="p-4 flex flex-col gap-3">
              <h1 className='text-lg md:text-xl font-semibold'>
                {course?.coursePrice ? `₹${course.coursePrice}` : 'Free'}
              </h1>
              <Separator />
              <p className='text-sm text-gray-500'>
                {purchased
                  ? 'You are already enrolled in this course.'
                  : 'Enroll now to get full access to all lectures.'}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">
                  Continue Course
                </Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;