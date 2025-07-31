import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";
import httpStatus from "http-status-codes";

const createRide = async (
  riderId: string,
  role: string,
  payload: Partial<IRide>
) => {
  if (role !== Role.RIDER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only riders are allowed to request rides."
    );
  }

  if (!payload.pickupLocation || !payload.destinationLocation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Pickup and Destination locations are Required."
    );
  }

  if (payload.pickupLocation.trim() === payload.destinationLocation.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Pickup and destination locations must be different."
    );
  }

  const existingRide = await Ride.findOne({
    rider: riderId,
    status: {
      $in: [
        RideStatus.REQUESTED,
        RideStatus.ACCEPTED,
        RideStatus.PICKED_UP,
        RideStatus.IN_TRANSIT,
      ],
    },
  });

  if (existingRide) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have an ongoing ride."
    );
  }

  const ride = await Ride.create({
    rider: riderId,
    pickupLocation: payload.pickupLocation,
    destinationLocation: payload.destinationLocation,
    fare: payload.fare,
    status: RideStatus.REQUESTED,
    requestedAt: new Date(),
  });

  return ride;
};

const getMyRides = async (userId: string, role: string) => {
  if (![Role.RIDER, Role.DRIVER].includes(role as Role)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view rides."
    );
  }

  const filter = role === Role.RIDER ? { rider: userId } : { driver: userId };

  const rides = await Ride.find(filter).sort({ createdAt: -1 });

  return rides;
};

const acceptRide = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  if (ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride is not available to accept."
    );
  }

  ride.driver = new Types.ObjectId(driverId);
  ride.status = RideStatus.IN_TRANSIT;
  ride.pickedUpAt = new Date();

  await ride.save();

  return ride;
};

const completeRide = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride Not Found.");
  }

  if (ride.driver?.toString() !== driverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  }

  if (ride.status === RideStatus.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Canceled ride cannot be completed."
    );
  }

  if (ride.status !== RideStatus.IN_TRANSIT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride can not be completed because it is not in transit."
    );
  }

  ride.status = RideStatus.COMPLETED;
  ride.completedAt = new Date();

  await ride.save();

  return ride;
};

const cancelRide = async (rideId: string, userId: string, role: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  const isRider = role === Role.RIDER && ride.rider.toString() === userId;
  const isDriver = role === Role.DRIVER && ride.driver?.toString() === userId;

  if (!isRider && !isDriver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancle this ride."
    );
  }

  if (isRider && ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rider can only cancel when the ride is in 'REQUESTED' status."
    );
  }

  if (isDriver && ride.status === RideStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver cannot cancel a completed ride."
    );
  }

  ride.status = RideStatus.CANCELLED;
  ride.cancelledAt = new Date();

  await ride.save();

  return ride;
};

const getAvailableRides = async () => {
  const rides = await Ride.find({ status: RideStatus.REQUESTED }).populate(
    "rider"
  );

  if (!rides.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No available rides at the moment."
    );
  }

  return rides;
};

const getAllRides = async () => {
  const rides = await Ride.find().populate("rider").populate("driver");

  if (!rides || rides.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found.");
  }

  return rides;
};

export const RideServices = {
  createRide,
  getMyRides,
  acceptRide,
  completeRide,
  cancelRide,
  getAvailableRides,
  getAllRides,
};
