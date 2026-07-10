import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { employeeId, name, password, role } = req.body;

    const existingUser = await User.findOne({
      employeeId,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      employeeId,
      name,
      password: hashedPassword,
      role,
    });

    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

export const getAttendanceUsers = async (
  req: Request,
  res: Response
) => {
  try {
    const users = await User.find({})
      .select("name role employeeId")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users.",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};
