import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createUserZodSchema,
  updateApprovalStatusZodSchema,
  updateDriverOnlineStatusZodSchema,
  updateProfileZodSchema,
  updateUserIsActiveZodSchema,
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

router.get(
  "/me",
  checkAuth("RIDER", "DRIVER", "ADMIN", "SUPER_ADMIN"),
  UserController.getMe
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.DRIVER, Role.RIDER, Role.SUPER_ADMIN),
  validateRequest(updateProfileZodSchema),
  UserController.updateProfile
);

router.patch(
  "/:id/approval-status",
  checkAuth(Role.ADMIN),
  validateRequest(updateApprovalStatusZodSchema),
  UserController.updateUserApprovalStatus
);

router.get("/", checkAuth(Role.ADMIN), UserController.getUsersForAdmin);

router.get("/:id", checkAuth(Role.ADMIN), UserController.getUserByIdForAdmin);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN),
  validateRequest(updateUserIsActiveZodSchema),
  UserController.updateUserIsActive
);

export const UserRoutes = router;
