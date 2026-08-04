import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

import Reminder from "../models/Reminder";

// ===============================
// GET REMINDERS
// ===============================

export const getReminders = async (
  req: Request,
  res: Response
) => {
  try {

    const reminders = await Reminder.find()
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .sort({
        dueDate: 1,
        createdAt: -1,
      });

    return res.json(reminders);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch reminders.",
    });

  }
};

// ===============================
// CREATE REMINDER
// ===============================

export const createReminder = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const reminder = await Reminder.create({

      title: req.body.title,

      description:
        req.body.description || "",

      module:
        req.body.module,

      relatedId:
        req.body.relatedId || null,

      assignedTo:
        req.body.assignedTo || null,

      priority:
        req.body.priority || "MEDIUM",

      status: "PENDING",

      dueDate:
        req.body.dueDate,

      createdBy:
        req.user?.userId,

    });

    const populated =
      await Reminder.findById(reminder._id)
        .populate("assignedTo", "name")
        .populate("createdBy", "name");

    return res.status(201).json(populated);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create reminder.",
    });

  }
};

// ===============================
// UPDATE REMINDER
// ===============================

export const updateReminder = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const reminder =
      await Reminder.findById(
        req.params.id
      );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    reminder.title =
      req.body.title;

    reminder.description =
      req.body.description || "";

    reminder.module =
      req.body.module;

    reminder.relatedId =
      req.body.relatedId || null;

    reminder.assignedTo =
      req.body.assignedTo || null;

    reminder.priority =
      req.body.priority;

    reminder.dueDate =
      req.body.dueDate;

    await reminder.save();

    const updated =
      await Reminder.findById(
        reminder._id
      )
        .populate("assignedTo", "name")
        .populate("createdBy", "name");

    return res.json(updated);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to update reminder.",
    });

  }
};

// ===============================
// MARK COMPLETE
// ===============================

export const completeReminder = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const reminder =
      await Reminder.findById(
        req.params.id
      );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    reminder.status =
      "COMPLETED";

    reminder.completedAt =
      new Date();

    await reminder.save();

    return res.json(reminder);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to complete reminder.",
    });

  }
};

// ===============================
// DELETE REMINDER
// ===============================

export const deleteReminder = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    const reminder =
      await Reminder.findByIdAndDelete(
        req.params.id
      );

    if (!reminder) {
      return res.status(404).json({
        message: "Reminder not found.",
      });
    }

    return res.json({
      message:
        "Reminder deleted successfully.",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message:
        "Failed to delete reminder.",
    });

  }
};