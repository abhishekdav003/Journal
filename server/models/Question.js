import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional - question can be for specific lecture or general
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    answers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
questionSchema.index({ course: 1 });
questionSchema.index({ student: 1 });

export default mongoose.model("Question", questionSchema);
