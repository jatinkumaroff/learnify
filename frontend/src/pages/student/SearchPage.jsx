import React, { useState } from "react";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [selectedCategories, setSelectedCatgories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("");

  // Skip the API call entirely if query is empty — avoids sending "null" or ""
  const { data, isLoading, isError } = useGetSearchCourseQuery(
    { searchQuery: query, categories: selectedCategories, sortByPrice },
    { skip: !query.trim() }
  );

  const courses = data?.courses ?? [];
  const isEmpty = !isLoading && courses.length === 0;

  const handleFilterChange = (categories, price) => {
    setSelectedCatgories(categories);
    setSortByPrice(price);
  };

  if (!query.trim()) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-32 p-6">
          <h1 className="font-bold text-2xl text-gray-700 dark:text-gray-200 mb-2">
            What do you want to learn?
          </h1>
          <p className="text-gray-500">Enter a search term to find courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="my-6">
        <h1 className="font-bold text-xl md:text-2xl">Results for "{query}"</h1>
        <p>
          Showing results for{" "}
          <span className="text-blue-800 font-bold italic">{query}</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-10">
        <Filter handleFilterChange={handleFilterChange} />
        <div className="flex-1">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => <CourseSkeleton key={idx} />)
          ) : isError ? (
            <CourseNotFound />
          ) : isEmpty ? (
            <CourseNotFound />
          ) : (
            courses.map((course) => <SearchResult key={course._id} course={course} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

const CourseNotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-32 dark:bg-gray-900 p-6">
    <AlertCircle className="text-red-500 h-16 w-16 mb-4" />
    <h1 className="font-bold text-2xl md:text-4xl text-gray-800 dark:text-gray-200 mb-2">
      Course Not Found
    </h1>
    <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
      Sorry, we couldn't find the course you're looking for.
    </p>
    <Link to="/" className="italic">
      <Button variant="link">Browse All Courses</Button>
    </Link>
  </div>
);

const CourseSkeleton = () => (
  <div className="flex-1 flex flex-col md:flex-row justify-between border-b border-gray-300 py-4">
    <div className="h-32 w-full md:w-64">
      <Skeleton className="h-full w-full object-cover" />
    </div>
    <div className="flex flex-col gap-2 flex-1 px-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-6 w-20 mt-2" />
    </div>
    <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
      <Skeleton className="h-6 w-12" />
    </div>
  </div>
);