import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEditCourseMutation, useGetCourseByIdQuery, usePublishCourseMutation } from '@/features/api/courseApi';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const CourseTab = () => {
    const navigate = useNavigate();
    const params = useParams();
    const [input, setInput] = useState({
        courseTitle: "",
        subTitle: "",
        description: "",
        category: "",
        courseLevel: "",
        coursePrice: "",
        courseThumbnail: ""
    })
    const courseId = params.courseId;
    const {data:courseByIdData, isLoading:courseByIdIsLoading, refetch} = useGetCourseByIdQuery(courseId);
    const [publishCourse, {data: publishCourseData}] = usePublishCourseMutation()
    useEffect(()=>{
        if(courseByIdData?.course){
            const course = courseByIdData?.course;
            setInput({
                courseTitle: course?.courseTitle,
        subTitle: course?.subTitle,
        description: course?.description,
        category: course?.category,
        courseLevel: course?.courseLevel,
        coursePrice: course?.coursePrice,
        courseThumbnail: "",
            })
        }
    },[courseByIdData])
    const [editCourse, { data, isSuccess, isLoading, error }] = useEditCourseMutation();
    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value })
    }
    const selectCategory = (value) => {
        setInput({ ...input, category: value });
    }
    const selectCourseLevel = (value) => {
        setInput({ ...input, courseLevel: value });
    }
    //file
    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, courseThumbnail: file });
            const filereader = new FileReader();
            filereader.onloadend = () => setPreviewThumbnail(filereader.result);
            filereader.readAsDataURL(file);
        }
    }
    const updateCourseHandler = async () => {
        const formData = new FormData();
        formData.append("courseTitle", input.courseTitle);
        formData.append("subTitle", input.subTitle);
        formData.append("description", input.description);
        formData.append("category", input.category);
        formData.append("courseLevel", input.courseLevel);
        formData.append("coursePrice", input.coursePrice);
        formData.append("courseThumbnail", input.courseThumbnail);
        
        await editCourse({formData,courseId});
    }
    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "Course Updated")
        }
        if (error) {
            toast.error(data.message || "Failed to update course")
        }
    }, [isSuccess, error])

    if(courseByIdIsLoading) return <LoadingSpinner/>
    const publishStatusHandler = async (action)=>{
        try {
            const res = await publishCourse({courseId, query:action});
            if(res.data){
                refetch();
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error("failed to do something");
        }
    }
    return (
        <Card>
            <CardHeader className='flex flex-row justify-between'>
                <div>
                    <CardTitle>Basic Course Information</CardTitle>
                    <CardDescription>
                        Make changes to your courses here. Click save when you're done.
                    </CardDescription>
                </div>
                <div className='space-x-2'>
                    <Button disabled={courseByIdData?.course.lectures.length === 0} variant='outline' onClick={()=>publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}>;
                        {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button>Remove Course</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-4 mt-5'>
                    <div>
                        <Label>Title</Label>
                        <Input type="text" value={input.courseTitle} onChange={changeEventHandler} name="courseTitle" placeholder="eg. java development" />
                    </div>
                    <div>
                        <Label>Subtitle</Label>
                        <Input type="text" value={input.subTitle} onChange={changeEventHandler} name="subTitle" placeholder="eg. microservices" />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={input.description} onChange={changeEventHandler} name="description" placeholder="Enter description..." />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div>
                            <Label>Category</Label>
                            <Select onValueChange={selectCategory}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="Next JS">Next JS</SelectItem>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                        <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                                        <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                                        <SelectItem value="Javascript">Javascript</SelectItem>
                                        <SelectItem value="Python">Python</SelectItem>
                                        <SelectItem value="Docker">Docker</SelectItem>
                                        <SelectItem value="MongoDB">MongoDB</SelectItem>
                                        <SelectItem value="HTML">HTML</SelectItem>
                                        <SelectItem value="CSS">CSS</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Course level</Label>
                            <Select onValueChange={selectCourseLevel}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a course level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Course Level</SelectLabel>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Advance">Advance</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Price in (INR)</Label>
                            <Input type="number" name="coursePrice" value={input.coursePrice} onChange={changeEventHandler} placeholder="eg. 199" className="w-fit" />
                        </div>
                    </div>
                    <div>
                        <Label>Course Thumbnail</Label>
                        <Input type="file" accept="image/*" onChange={selectThumbnail} className="w-fit" />
                        {
                            previewThumbnail && <img src={previewThumbnail} className='w-64 my-2' alt='Course Thumbnail' />
                        }
                    </div>
                    <div className=''>
                        <Button variant="outline" onClick={() => navigate('/admin/course')}>Cancel</Button>
                        <Button disabled={isLoading} onClick={updateCourseHandler}>
                            {
                                isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Please wait...
                                    </>
                                ) : "Save"
                            }
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CourseTab