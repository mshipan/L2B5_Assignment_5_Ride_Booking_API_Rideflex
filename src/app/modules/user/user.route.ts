import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createUserZodSchema,
  updateApprovalStatusZodSchema,
  updateDriverOnlineStatusZodSchema,
} from "./user.validation";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

router.patch(
  "/driver/availability",
  checkAuth(Role.DRIVER),
  validateRequest(updateDriverOnlineStatusZodSchema),
  UserController.setDriverOnlineStatus
);

router.patch(
  "/:id/approval-status",
  checkAuth(Role.ADMIN),
  validateRequest(updateApprovalStatusZodSchema),
  UserController.updateUserApprovalStatus
);

export const UserRoutes = router;
