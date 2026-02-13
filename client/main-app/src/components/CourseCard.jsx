/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { FiBook, FiStar, FiPlay } from "react-icons/fi";

export default function CourseCard({ course, user, purchasedCourses = [] }) {
  const router = useRouter();

  const isEnrolled = purchasedCourses.includes(course._id);

  const getCourseUrl = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, "-");
    return `/course/${course._id}/${courseName}`;
  };

  const getLearnUrl = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, "-");
    return `/learn/${course._id}/${courseName}`;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      alert("Please login to add courses to cart");
      router.push("/auth/student");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item._id === course._id);

    if (!existingItem) {
      cart.push({
        _id: course._id,
        title: course.title,
        price: course.price,
        thumbnail: course.thumbnail,
        tutor: course.tutor,
        category: course.category,
        level: course.level,
      });
      localStorage.setItem("cart", JSON.stringify(cart));

      // Trigger cart update event
      window.dispatchEvent(new Event("cart-update"));

      alert("Course added to cart!");
    } else {
      alert("Course already in cart!");
    }
  };

  const handleGoToCourse = (e) => {
    e.stopPropagation();
    router.push(getLearnUrl(course));
  };

  return (
    <div className="group border border-gray-800 hover:border-purple-500/50 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/10">
      {/* Course Image */}
      <div
        onClick={() => router.push(getCourseUrl(course))}
        className="relative aspect-video bg-linear-to-br from-purple-900/30 to-pink-900/30 overflow-hidden cursor-pointer"
      >
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#1E1E2E]">
            <FiBook className="text-purple-400 text-5xl opacity-40" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-4">
        <h3
          onClick={() => router.push(getCourseUrl(course))}
          className="font-bold text-white text-base line-clamp-2 leading-snug mb-2 group-hover:text-purple-400 transition-colors cursor-pointer min-h-[2.8rem]"
        >
          {course.title}
        </h3>

        <p
          onClick={() => router.push(getCourseUrl(course))}
          className="text-gray-400 text-xs mb-2 cursor-pointer"
        >
          {course.tutor?.name || "Expert Instructor"}
        </p>

        {/* Rating and Reviews */}
        <div
          onClick={() => router.push(getCourseUrl(course))}
          className="flex items-center gap-2 text-xs mb-2 cursor-pointer"
        >
          {course.rating > 0 && (
            <>
              <span className="font-bold text-orange-400">
                {course.rating.toFixed(1)}
              </span>
              <div className="flex items-center text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={
                      i < Math.floor(course.rating) ? "fill-current" : ""
                    }
                    size={12}
                  />
                ))}
              </div>
            </>
          )}
          <span className="text-gray-500">
            ({course.enrolledStudents?.length || 0} ratings)
          </span>
        </div>

        {/* Duration and Lectures */}
        <p
          onClick={() => router.push(getCourseUrl(course))}
          className="text-xs text-gray-400 mb-2 cursor-pointer"
        >
          {course.totalDuration || "30.5 total hours"} •{" "}
          {course.lectures?.length ||
            course.modules?.reduce(
              (acc, mod) => acc + (mod.lectures?.length || 0),
              0,
            ) ||
            0}{" "}
          lectures • {course.level || "All Levels"}
        </p>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div
            onClick={() => router.push(getCourseUrl(course))}
            className="cursor-pointer"
          >
            <p className="text-lg font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ₹{course.price?.toLocaleString() || 0}
            </p>
            {course.originalPrice && (
              <p className="text-xs text-gray-500 line-through">
                ₹{course.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Button - Go to Course or Add to Cart */}
          {isEnrolled ? (
            <button
              onClick={handleGoToCourse}
              className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm rounded-lg transition-all flex items-center gap-2"
            >
              <FiPlay size={14} />
              Go to Course
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-purple-900 font-bold text-sm rounded-lg transition-all border-2 border-purple-500/20 hover:border-purple-500/50"
            >
              Add to cart
            </button>
          )}
        </div>

        {/* Category Badge */}
        {course.category && (
          <div
            onClick={() => router.push(getCourseUrl(course))}
            className="mt-2 cursor-pointer"
          >
            <span className="inline-block px-2 py-1 bg-linear-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 text-yellow-400 rounded text-[10px] font-bold uppercase">
              {course.category}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
