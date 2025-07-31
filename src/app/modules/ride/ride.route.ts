import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRideZodSchema } from "./ride.validation";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  checkAuth(Role.RIDER),
  validateRequest(createRideZodSchema),
  RideController.createRide
);

router.get("/my-rides", checkAuth(Role.RIDER), RideController.getMyRides);

router.patch("/:id/accept", checkAuth(Role.DRIVER), RideController.acceptRide);

router.patch(
  "/:id/complete",
  checkAuth(Role.DRIVER),
  RideController.completeRide
);

router.patch(
  "/:id/cancel",
  checkAuth(Role.RIDER, Role.DRIVER),
  RideController.cancelRide
);

router.get(
  "/available",
  checkAuth(Role.DRIVER),
  RideController.getAvailableRides
);

router.get("/all-rides", checkAuth(Role.ADMIN), RideController.getAllRides);

export const RideRoutes = router;
