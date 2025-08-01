import { Types } from "mongoose";

export enum RideStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IRide {
  rider: Types.ObjectId;
  driver?: Types.ObjectId;
  pickupLocation: string;
  destinationLocation: string;
  fare?: number;
  distanceInKm?: number;
  durationInMinutes?: number;
  status?: RideStatus;
  requestedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export interface RideQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}
