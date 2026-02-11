import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateLectureMutation, useGetCourseLectureQuery } from '@/features/api/courseApi'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Lecture from './Lecture'

const getErrorMessage = (error, fallbackMessage) => {
    if (!error) return fallbackMessage;
    if (typeof error?.data?.message === "string") return error.data.message;
    if (typeof error?.error === "string") return error.error;
    return fallbackMessage;
}

function CreateLecture() {
    const [lectureTitle, setLectureTitle] = useState("");
    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();

    const [createLecture, { data, error, isLoading, isSuccess }] = useCreateLectureMutation();
    const { data: lectureData, isLoading: lectureLoading, isError: lectureError ,refetch} = useGetCourseLectureQuery(courseId);

    const createLectureHandler = async () => {
        await createLecture({ lectureTitle, courseId });
    }

    useEffect(() => {
        if (isSuccess) {
            refetch();
            toast.success(data?.message || "Lecture created successfully.");
        }
        if (error) {
            toast.error(getErrorMessage(error, "Failed to create lecture."));
        }
    }, [isSuccess, data, error, refetch])
    return (
        <div className='flex-1 mx-10'>
            <div className='mb-4'>
                <h1 className='font-bold text-xl '>Lets's add Lecture , add some basic course details for your new course</h1>
                <p className='text-sm'>Lorem ipsum dolor sit amet consectqrghweri erheir idvha rrgiaaaffhaereg jaj.</p>
            </div>
            <div className='space-y-4'>
                <div>
                    <Label>Title</Label>
                    <Input type="text" value={lectureTitle} onChange={(e) => setLectureTitle(e.target.value)} placeholder="Your Title Name" />
                </div>
                <div className='flex items-enter gap-2'>
                    <Button variant="outline" onClick={() => navigate(`/admin/course/${courseId}`)}>Back to course</Button>
                    <Button disabled={isLoading} onClick={createLectureHandler}>
                        {
                            isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Please wait
                                </>
                            ) : (
                                "Create Lecture"
                            )
                        }
                    </Button>
                </div>
                <div className='mt-10'>
                    {
                        lectureLoading ? ( 
                        <p>Loading Lecture...</p>
                    ) : lectureError ? (
                        <p>Failed to load lectures.</p>
                    ) : lectureData.lectures.length == 0 ? (
                        <p>No lectures uploaded.</p> 
                    ) : (
                    lectureData.lectures.map((lecture, index) => (
                        <Lecture key={lecture._id} lecture={lecture} courseId={courseId} index = {index}/>
                    ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default CreateLecture
