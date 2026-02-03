import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Lecture title is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"],
  },
  videoPublicId: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Module title is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  lectures: [lectureSchema],
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
    modules: [moduleSchema],
    lectures: [lectureSchema], // Keep for backward compatibility
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
    isArchived: {
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
  let total = 0;

  // Calculate from lectures array
  if (this.lectures && this.lectures.length > 0) {
    total += this.lectures.reduce(
      (sum, lecture) => sum + (lecture.duration || 0),
      0,
    );
  }

  // Calculate from modules
  if (this.modules && this.modules.length > 0) {
    this.modules.forEach((module) => {
      if (module.lectures && module.lectures.length > 0) {
        total += module.lectures.reduce(
          (sum, lecture) => sum + (lecture.duration || 0),
          0,
        );
      }
    });
  }

  this.totalDuration = total;
  next();
});

// Virtual for formatted price
courseSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price}`;
});

export default mongoose.model("Course", courseSchema);
