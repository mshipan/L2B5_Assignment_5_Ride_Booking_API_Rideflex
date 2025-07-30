import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { RideServices } from "./ride.service";
import { JwtPayload } from "jsonwebtoken";

const createRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rider = req.user as JwtPayload;

    const result = await RideServices.createRide(
      rider.userId,
      rider.role,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Ride Requested Successfully",
      data: result,
    });
  }
);

export const RideController = {
  createRide,
};
