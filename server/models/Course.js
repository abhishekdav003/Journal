import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Lecture title is required"],
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"],
  },
  videoPublicId: {
    type: String,
    required: [true, "Video public ID is required"],
  },
  duration: {
    type: Number,
    required: [true, "Video duration is required"],
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "programming",
        "design",
        "business",
        "marketing",
        "photography",
        "music",
        "other",
      ],
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      enum: ["beginner", "intermediate", "advanced"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    thumbnailPublicId: {
      type: String,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tutor is required"],
    },
    lectures: [lectureSchema],
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalDuration: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
courseSchema.index({ tutor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ title: "text", description: "text" });

// Calculate total duration
courseSchema.pre("save", function (next) {
  if (this.isModified("lectures")) {
    this.totalDuration = this.lectures.reduce(
      (total, lecture) => total + lecture.duration,
      0,
    );
  }
  next();
});

// Virtual for formatted price
courseSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price}`;
});

export default mongoose.model("Course", courseSchema);
