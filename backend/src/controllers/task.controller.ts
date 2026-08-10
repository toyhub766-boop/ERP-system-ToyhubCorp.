import { Request, Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "../middlewares/auth.middleware";

// GET ALL TASKS
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
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks.",
    });
  }
};

// GET TASKS FOR ONE USER
export const getTasksByUser = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.params.userId,
    })
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate(
        "assignedBy",
        "name role employeeId"
      )
      .sort({ createdAt: -1 });

    const total = tasks.length;

    const completed = tasks.filter(
      (task) => task.completed
    ).length;

    const score =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    res.json({
      tasks,
      stats: {
        total,
        completed,
        pending: total - completed,
        score,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user tasks.",
    });
  }
};

// CREATE TASK
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
        message: "Task title is required.",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        message: "Assigned user is required.",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        message: "User authentication required.",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.userId,
      priority,
      dueDate: dueDate || null,
      remarks,
      checklist: checklist || [],
      completed: false,
    });

    const populatedTask = await Task.findById(task._id)
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate(
        "assignedBy",
        "name role employeeId"
      );

    res.status(201).json(populatedTask);
  } catch (error: any) {
    console.error("CREATE TASK ERROR:");
    console.error(error);

    res.status(500).json({
      message:
        error?.message || "Failed to create task.",
    });
  }
};

// UPDATE TASK
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
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task.",
    });
  }
};

// TOGGLE TASK COMPLETION
export const toggleTaskCompletion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const task = await Task.findById(
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    task.completed = !task.completed;

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

    res.json(updatedTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to update task completion.",
    });
  }
};

// DELETE TASK
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
        message: "Task not found.",
      });
    }

    res.json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task.",
    });
  }
};