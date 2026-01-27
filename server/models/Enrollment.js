import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    progress: [
      {
        lecture: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: Date,
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Calculate completion percentage
enrollmentSchema.methods.updateProgress = function () {
  const completed = this.progress.filter((p) => p.completed).length;
  const total = this.progress.length;
  this.completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  if (this.completionPercentage === 100 && !this.certificateIssued) {
    this.certificateIssued = true;
  }
};

export default mongoose.model("Enrollment", enrollmentSchema);
