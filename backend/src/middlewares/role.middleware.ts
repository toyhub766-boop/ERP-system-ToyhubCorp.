import { Response, NextFunction } from "express";

import { AuthRequest } from "./auth.middleware";

const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    console.log("Allowed Roles:", allowedRoles);
    console.log("User Role:", req.user?.role);

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied",
      });
    }

    next();
  };
};

export default roleMiddleware;
