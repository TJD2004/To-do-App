const mongoose = require("mongoose");

const CATEGORIES = ["personal", "work", "shopping", "health", "finance", "other"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // Bonus: due date support
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Allow null/undefined; if set, must be a valid date
          return value === null || value === undefined || value instanceof Date;
        },
        message: "Due date must be a valid date",
      },
    },
    // Bonus: category support
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(", ")}`,
      },
      default: "other",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: is task overdue?
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.completed) return false;
  return new Date() > this.dueDate;
});

// Index for efficient sorting by creation date
taskSchema.index({ createdAt: -1 });
taskSchema.index({ category: 1, completed: 1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task, CATEGORIES };
