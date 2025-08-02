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

router.get(
  "/rider-history",
  checkAuth(Role.RIDER),
  RideController.getRiderRideHistory
);

router.get(
  "/driver-history",
  checkAuth(Role.DRIVER),
  RideController.getDriverRideHistory
);

router.get(
  "/available",
  checkAuth(Role.DRIVER),
  RideController.getAvailableRides
);

router.get("/my-rides", checkAuth(Role.RIDER), RideController.getMyRides);

router.get("/all-rides", checkAuth(Role.ADMIN), RideController.getAllRides);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.DRIVER, Role.RIDER),
  RideController.getRideById
);

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

export const RideRoutes = router;
