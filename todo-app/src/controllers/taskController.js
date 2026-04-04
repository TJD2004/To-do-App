const { Task } = require("../models/Task");

// Helper to build a standardised success response
const success = (res, data, statusCode = 200, message = "Success") =>
  res.status(statusCode).json({ success: true, message, data });

// ─── GET /tasks ──────────────────────────────────────────────────────────────
// Supports ?completed=true|false, ?category=work, ?sort=dueDate
const getAllTasks = async (req, res, next) => {
  try {
    const filter = {};
    const { completed, category, sort } = req.query;

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    if (category) {
      filter.category = category;
    }

    const sortMap = {
      dueDate: { dueDate: 1 },
      "-dueDate": { dueDate: -1 },
      title: { title: 1 },
      "-createdAt": { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortOption).lean({ virtuals: true });

    success(res, { tasks, total: tasks.length });
  } catch (err) {
    next(err);
  }
};

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).lean({ virtuals: true });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    success(res, { task });
  } catch (err) {
    next(err);
  }
};

// ─── POST /tasks ─────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, category } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      category: category || "other",
    });

    success(res, { task }, 201, "Task created successfully");
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /tasks/:id ─────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { title, description, completed, dueDate, category } = req.body;

    // Validation: can't mark already-completed task as complete again
    if (completed === true && task.completed === true) {
      return res.status(400).json({
        success: false,
        message: "Task is already marked as completed",
      });
    }

    // Allow explicitly unmarking (completed: false) at any time
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate === null ? null : new Date(dueDate);
    if (category !== undefined) task.category = category;

    if (completed !== undefined) {
      task.completed = completed;
      // Record when the task was completed; clear it if un-completing
      task.completedAt = completed ? new Date() : null;
    }

    await task.save();

    const updated = task.toObject({ virtuals: true });
    success(res, { task: updated }, 200, "Task updated successfully");
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /tasks/:id/complete ────────────────────────────────────────────────
// Convenience endpoint – marks task complete without a body payload
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.completed) {
      return res.status(400).json({
        success: false,
        message: "Task is already marked as completed",
      });
    }

    task.completed = true;
    task.completedAt = new Date();
    await task.save();

    const updated = task.toObject({ virtuals: true });
    success(res, { task: updated }, 200, "Task marked as completed");
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    success(res, { id: req.params.id }, 200, "Task deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
};
