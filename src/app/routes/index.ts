import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { RideRoutes } from "../modules/ride/ride.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/rides",
    route: RideRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
