import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Request, Response } from "express";

export const login = async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;

    const user = await User.findOne({
      employeeId,
    });

    console.log("LOGIN REQUEST:", {
      employeeId,
      password,
    });

    console.log("DATABASE USER:", user);

    if (!user) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = user.password.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : password === user.password;

    console.log("PASSWORD RESULT:", {
      entered: password,
      stored: user?.password,
      isMatch,
    });

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login Failed",
    });
  }
};
