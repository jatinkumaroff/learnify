import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COURSE_PURCHASE_API } from "@/lib/apiBaseUrl";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: ["PurchaseStatus"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Instant enrollment - no Stripe
    enrollCourse: builder.mutation({
      query: (courseId) => ({
        url: "/enroll",
        method: "POST",
        body: { courseId },
      }),
      // Invalidate so PurchaseCourseProtectedRoute and CourseDetail refetch purchase status
      invalidatesTags: ["PurchaseStatus"],
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ["PurchaseStatus"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useEnrollCourseMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
} = purchaseApi;