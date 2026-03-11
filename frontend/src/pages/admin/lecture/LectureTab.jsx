import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from '@/features/api/courseApi'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

const getErrorMessage = (error, fallbackMessage) => {
    if (!error) return fallbackMessage;
    if (typeof error?.data?.message === "string") return error.data.message;
    if (typeof error?.error === "string") return error.error;
    return fallbackMessage;
}

// ── Replace these two values with your actual Cloudinary details ─────────────
// CLOUD_NAME : Cloudinary dashboard → top-right → "Cloud name: xxxxx"
// UPLOAD_PRESET : Cloudinary → Settings → Upload → Upload Presets
//                 → Add preset → Signing Mode = Unsigned → Save → copy name
const CLOUDINARY_CLOUD_NAME = "ddxzyyll9";
const CLOUDINARY_UPLOAD_PRESET = "learnify_videos";
// ─────────────────────────────────────────────────────────────────────────────

const LectureTab = () => {
    const [lectureTitle, setLectureTitle] = useState("");
    const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
    const [isFree, setIsFree] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("idle");

    const params = useParams();
    const { courseId, lectureId } = params;

    const { data: lectureData } = useGetLectureByIdQuery(lectureId);
    const lecture = lectureData?.lecture;

    useEffect(() => {
        if (lecture) {
            setLectureTitle(lecture.lectureTitle);
            setIsFree(lecture.isPreviewFree);
            if (lecture.videoUrl) {
                setUploadVideoInfo({ videoUrl: lecture.videoUrl, publicId: lecture.publicId });
                setUploadStatus("saved");
            }
        }
    }, [lecture]);

    const [editLecture, { data, error, isSuccess }] = useEditLectureMutation();
    const [removeLecture, { data: removeData, error: removeError, isSuccess: removeSuccess }] = useRemoveLectureMutation();

    const saveToDatabase = async (overrideVideoInfo) => {
        const videoInfo = overrideVideoInfo ?? uploadVideoInfo;
        await editLecture({ lectureTitle, videoInfo, isPreviewFree: isFree, courseId, lectureId });
    };

    const fileChangeHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        setUploadStatus("uploading");
        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
                formData
            );
            const newVideoInfo = {
                videoUrl: res.data.secure_url,
                publicId: res.data.public_id,
            };
            setUploadVideoInfo(newVideoInfo);
            setUploadStatus("saving");
            await saveToDatabase(newVideoInfo);
            setUploadStatus("saved");
            toast.success("Video uploaded and saved!");
        } catch (err) {
            console.error("Video upload error:", err?.response?.data || err.message);
            setUploadStatus("error");
            toast.error("Video upload failed. Check your Cloudinary cloud name and preset.");
        }
    };

    const editLectureHandler = async () => {
        setUploadStatus("saving");
        await saveToDatabase();
    };

    const removeLectureHandler = async () => {
        await removeLecture(lectureId);
    };

    useEffect(() => {
        if (isSuccess) {
            setUploadStatus(uploadVideoInfo ? "saved" : "idle");
            toast.success(data?.message || "Lecture updated successfully.");
        }
        if (error) {
            setUploadStatus("error");
            toast.error(getErrorMessage(error, "Failed to update lecture."));
        }
    }, [isSuccess, error]);

    useEffect(() => {
        if (removeSuccess) toast.success(removeData?.message || "Lecture removed successfully.");
        if (removeError) toast.error(getErrorMessage(removeError, "Failed to remove lecture."));
    }, [removeSuccess, removeData, removeError]);

    const isBusy = uploadStatus === "uploading" || uploadStatus === "saving";

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle>Edit Lecture</CardTitle>
                    <CardDescription>Make changes and click save when done.</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="destructive" onClick={removeLectureHandler} disabled={isBusy}>
                        Remove Lecture
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <div>
                    <Label>Title</Label>
                    <Input
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        placeholder="Ex. Introduction to Javascript"
                    />
                </div>

                <div>
                    <Label>Video <span className='text-red-500'>*</span></Label>
                    {uploadVideoInfo?.videoUrl && (
                        <p className="text-xs text-gray-400 mt-1 mb-2 break-all">
                            Saved: <a href={uploadVideoInfo.videoUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">{uploadVideoInfo.videoUrl}</a>
                        </p>
                    )}
                    <Input
                        type="file"
                        accept="video/*"
                        onChange={fileChangeHandler}
                        className="w-fit"
                        disabled={isBusy}
                    />
                    {uploadStatus === "uploading" && <p className="text-sm text-blue-500 font-medium mt-2">Uploading...</p>}
                    {uploadStatus === "saving"   && <p className="text-sm text-blue-500 font-medium mt-2">Saving...</p>}
                    {uploadStatus === "saved"    && <p className="text-sm text-green-600 font-medium mt-2">✓ Video saved successfully</p>}
                    {uploadStatus === "error"    && <p className="text-sm text-red-600 font-medium mt-2">✗ Upload failed — please try again</p>}
                </div>

                <div className='flex items-center space-x-2'>
                    <Switch checked={isFree} onCheckedChange={setIsFree} id="preview-free" />
                    <Label htmlFor="preview-free">Is this video FREE?</Label>
                </div>

                <Button onClick={editLectureHandler} disabled={isBusy}>
                    Update Lecture
                </Button>
            </CardContent>
        </Card>
    );
};

export default LectureTab;