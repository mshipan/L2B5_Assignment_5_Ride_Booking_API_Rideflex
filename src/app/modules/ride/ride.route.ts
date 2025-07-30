import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRideZodSchema } from "./ride.validation";
import { RideController } from "./ride.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  validateRequest(createRideZodSchema),
  RideController.createRide
);

export const RideRoutes = router;
