const { body, param, validationResult } = require("express-validator");
const { CATEGORIES } = require("../models/Task");

// Helper to collect and format validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Validate MongoDB ObjectId in route params
const validateId = [
  param("id").isMongoId().withMessage("Invalid task ID format"),
  handleValidationErrors,
];

// Rules for creating a new task
const validateCreateTask = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("dueDate")
    .optional({ nullable: true })
    .isISO8601().withMessage("Due date must be a valid ISO 8601 date (e.g. 2024-12-31)"),

  body("category")
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  handleValidationErrors,
];

// Rules for updating a task (all fields optional)
const validateUpdateTask = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

  body("completed")
    .optional()
    .isBoolean().withMessage("Completed must be a boolean"),

  body("dueDate")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (!isNaN(Date.parse(value))) return true;
      throw new Error("Due date must be a valid ISO 8601 date");
    }),

  body("category")
    .optional()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(", ")}`),

  handleValidationErrors,
];

module.exports = { validateId, validateCreateTask, validateUpdateTask };
