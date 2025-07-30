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

export const RideServices = {
  createRide,
  getMyRides,
};
