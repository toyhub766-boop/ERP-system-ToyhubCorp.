import { Request, Response } from "express";
import Task from "../models/Task";

// GET ALL
export const getTasks = async (
  req: Request,
  res: Response
) => {
  try {
    const tasks = await Task.find()
      .populate(
        "assignedTo",
        "name role employeeId"
      )
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks.",
    });
  }
};

// CREATE
export const createTask = async (
  req: Request,
  res: Response
) => {
  try {
    const task = await Task.create(req.body);

    res.status(201).json(task);
  } catch (error: any) {
  console.log(error);

  console.log(error.errors);

  console.log(error.message);

  res.status(500).json({
    message: error.message,
  });
}
};

// UPDATE
export const updateTask = async (
  req: Request,
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

// DELETE
export const deleteTask = async (
  req: Request,
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
      message:
        "Task deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task.",
    });
  }
};