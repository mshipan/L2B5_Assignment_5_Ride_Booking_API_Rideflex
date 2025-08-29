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

const getRideById = catchAsync(async (req: Request, res: Response) => {
  const rideId = req.params.id;
  const user = req.user;

  const ride = await RideServices.getRideById(rideId, user as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride details fetched successfully.",
    data: ride,
  });
});

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

const pickupRide = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const rideId = req.params.id;

  const result = await RideServices.pickupRide(rideId, driver.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride picked up successfully.",
    data: result,
  });
});

const startTransit = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;
  const rideId = req.params.id;

  const result = await RideServices.startTransit(rideId, driver.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride is now in transit.",
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

const cancelRideByDriver = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const rideId = req.params.id;

  const result = await RideServices.cancelRideByDriver(rideId, user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride cancelled by driver successfully.",
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

const getRiderRideHistory = catchAsync(async (req: Request, res: Response) => {
  const rider = req.user as JwtPayload;
  const riderId = rider.userId;

  const rides = await RideServices.getRiderRideHistory(riderId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rider ride history fetched successfylly.",
    data: rides,
  });
});

const getDriverRideHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const rides = await RideServices.getDriverRideHistory(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver ride history retrieved successfully.",
    data: rides,
  });
});

const getDriverEarnings = catchAsync(async (req: Request, res: Response) => {
  const driver = req.user as JwtPayload;

  const result = await RideServices.getDriverEarnings(driver.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver earnings retrieved successfully.",
    data: result,
  });
});

const estimateFare = catchAsync(async (req: Request, res: Response) => {
  const { pickupLocation, destinationLocation } = req.body;

  const result = await RideServices.estimateFare(
    pickupLocation,
    destinationLocation
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Fare estimated successfully.",
    data: result,
  });
});

export const RideController = {
  createRide,
  getRideById,
  getMyRides,
  acceptRide,
  pickupRide,
  startTransit,
  completeRide,
  cancelRide,
  cancelRideByDriver,
  getAvailableRides,
  getAllRides,
  getRiderRideHistory,
  getDriverRideHistory,
  getDriverEarnings,
  estimateFare,
};
