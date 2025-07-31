/* eslint-disable @typescript-eslint/no-unused-vars */
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

const getMyRides = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const userId = user.userId;

  const role = user.role;

  const result = await RideServices.getMyRides(userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rides fetched Successfully",
    data: result,
  });
});

const acceptRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;

  const id = req.params.id;

  const result = await RideServices.acceptRide(id, driver.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride accepted successfully.",
    data: result,
  });
});

const completeRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;

  const rideId = req.params.id;

  const result = await RideServices.completeRide(rideId, driver.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride completed Successfully.",
    data: result,
  });
});

const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const rideId = req.params.id;

  const result = await RideServices.cancelRide(rideId, user.userId, user.role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride canclled successfully.",
    data: result,
  });
});

const getAvailableRides = catchAsync(async (req: Request, res: Response) => {
  const result = await RideServices.getAvailableRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Available rides fetched successfully.",
    data: result,
  });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {
  const result = await RideServices.getAllRides();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All rides fetched successfully.",
    data: result,
  });
});

export const RideController = {
  createRide,
  getMyRides,
  acceptRide,
  completeRide,
  cancelRide,
  getAvailableRides,
  getAllRides,
};
