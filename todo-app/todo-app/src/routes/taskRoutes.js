const express = require("express");
const router = express.Router();

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} = require("../controllers/taskController");

const {
  validateId,
  validateCreateTask,
  validateUpdateTask,
} = require("../middleware/validate");

// ── Collection routes ────────────────────────────────────────────────────────
router.route("/")
  .get(getAllTasks)          // GET    /api/tasks
  .post(validateCreateTask, createTask);  // POST   /api/tasks

// ── Single-resource routes ───────────────────────────────────────────────────
router.route("/:id")
  .get(validateId, getTaskById)     // GET    /api/tasks/:id
  .patch(validateId, validateUpdateTask, updateTask)  // PATCH  /api/tasks/:id
  .delete(validateId, deleteTask);  // DELETE /api/tasks/:id

// ── Convenience: mark complete ───────────────────────────────────────────────
router.patch("/:id/complete", validateId, completeTask); // PATCH /api/tasks/:id/complete

module.exports = router;
