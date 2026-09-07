import { Response } from "express";

import Task from "../models/Task";

import { AuthRequest } from "../middlewares/auth.middleware";

// =========================================================
// GET ALL TASKS
// ADMIN / HR / FOUNDER
// =========================================================

export const getTasks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tasks = await Task.find()
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate(
        "assignedBy",
        "name role employeeId"
      )
      .sort({
        createdAt: -1,
      });

    return res.json(tasks);
  } catch (error) {
    console.error(
      "GET TASKS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch tasks.",
    });
  }
};

// =========================================================
// GET TASKS FOR ONE USER
// ADMIN / HR
// =========================================================

export const getTasksByUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tasks = await Task.find({
      assignedTo:
        req.params.userId,
    })
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate(
        "assignedBy",
        "name role employeeId"
      )
      .sort({
        createdAt: -1,
      });

    const total =
      tasks.length;

    const completed =
      tasks.filter(
        (task) =>
          task.completed
      ).length;

    const score =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    return res.json({
      tasks,
      stats: {
        total,
        completed,
        pending:
          total - completed,
        score,
      },
    });
  } catch (error) {
    console.error(
      "GET USER TASKS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch user tasks.",
    });
  }
};

// =========================================================
// GET MY TASKS
// EMPLOYEE
//
// IMPORTANT:
// Uses authenticated user's ID.
// The employee cannot choose another userId.
// =========================================================

export const getMyTasks = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        message:
          "User authentication required.",
      });
    }

    const tasks = await Task.find({
      assignedTo:
        req.user.userId,
    })
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate(
        "assignedBy",
        "name role employeeId"
      )
      .sort({
        dueDate: 1,
        createdAt: -1,
      });

    const total =
      tasks.length;

    const completed =
      tasks.filter(
        (task) =>
          task.completed
      ).length;

    const pending =
      total - completed;

    const score =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    const checklistItems =
      tasks.flatMap(
        (task) =>
          task.checklist || []
      );

    const checklistTotal =
      checklistItems.length;

    const checklistCompleted =
      checklistItems.filter(
        (item) =>
          item.completed
      ).length;

    const checklistScore =
      checklistTotal === 0
        ? 0
        : Math.round(
            (checklistCompleted /
              checklistTotal) *
              100
          );

    return res.json({
      tasks,

      stats: {
        total,
        completed,
        pending,
        score,

        checklistTotal,
        checklistCompleted,
        checklistPending:
          checklistTotal -
          checklistCompleted,
        checklistScore,
      },
    });
  } catch (error) {
    console.error(
      "GET MY TASKS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch your tasks.",
    });
  }
};

// =========================================================
// CREATE TASK
// ADMIN / HR / FOUNDER
// =========================================================

export const createTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      remarks,
      checklist,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message:
          "Task title is required.",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        message:
          "Assigned user is required.",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        message:
          "User authentication required.",
      });
    }

    const task =
      await Task.create({
        title:
          title.trim(),

        description:
          description || "",

        assignedTo,

        assignedBy:
          req.user.userId,

        priority:
          priority || "Medium",

        dueDate:
          dueDate || null,

        remarks:
          remarks || "",

        checklist:
          Array.isArray(
            checklist
          )
            ? checklist
            : [],

        completed: false,
      });

    const populatedTask =
      await Task.findById(
        task._id
      )
        .populate(
          "assignedTo",
          "name role employeeId"
        )
        .populate(
          "assignedBy",
          "name role employeeId"
        );

    return res.status(201).json(
      populatedTask
    );
  } catch (error: any) {
    console.error(
      "CREATE TASK ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Failed to create task.",
    });
  }
};

// =========================================================
// UPDATE TASK
// ADMIN / HR / FOUNDER
// =========================================================

export const updateTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task =
      await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "assignedTo",
          "name role employeeId"
        )
        .populate(
          "assignedBy",
          "name role employeeId"
        );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found.",
      });
    }

    return res.json(task);
  } catch (error) {
    console.error(
      "UPDATE TASK ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update task.",
    });
  }
};

// =========================================================
// TOGGLE WHOLE TASK
// EXISTING ADMIN FUNCTION
// =========================================================

export const toggleTaskCompletion =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const task =
        await Task.findById(
          req.params.id
        );

      if (!task) {
        return res
          .status(404)
          .json({
            message:
              "Task not found.",
          });
      }

      task.completed =
        !task.completed;

      /*
       * If the whole task is manually marked
       * incomplete, we leave checklist state alone.
       *
       * If marked complete, we also complete
       * all checklist items so the two states
       * don't contradict each other.
       */

      if (task.completed) {
        task.checklist.forEach(
          (item) => {
            item.completed =
              true;
          }
        );
      }

      await task.save();

      const updatedTask =
        await Task.findById(
          task._id
        )
          .populate(
            "assignedTo",
            "name role employeeId"
          )
          .populate(
            "assignedBy",
            "name role employeeId"
          );

      return res.json(
        updatedTask
      );
    } catch (error) {
      console.error(
        "TOGGLE TASK ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update task completion.",
      });
    }
  };
// =========================================================
// TOGGLE CHECKLIST ITEM
// EMPLOYEE — ONLY THEIR OWN ASSIGNED TASKS
// =========================================================

export const toggleChecklistItem = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        message: "User authentication required.",
      });
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      assignedTo: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found or not assigned to you.",
      });
    }

    const item = task.checklist.find(
      (checkItem: any) =>
        String(checkItem._id) ===
        String(req.params.itemId)
    );

    if (!item) {
      return res.status(404).json({
        message: "Checklist item not found.",
      });
    }

    item.completed = !item.completed;

    // Automatically update whole-task completion.
    if (task.checklist.length > 0) {
      task.completed = task.checklist.every(
        (checkItem: any) =>
          checkItem.completed === true
      );
    }

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedTo",
          "name role employeeId"
        )
        .populate(
          "assignedBy",
          "name role employeeId"
        );

    return res.json(updatedTask);
  } catch (error) {
    console.error(
      "TOGGLE CHECKLIST ITEM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update checklist item.",
    });
  }
};

// =========================================================
// DELETE TASK
// =========================================================

export const deleteTask = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task =
      await Task.findByIdAndDelete(
        req.params.id
      );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found.",
      });
    }

    return res.json({
      message:
        "Task deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE TASK ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete task.",
    });
  }
};