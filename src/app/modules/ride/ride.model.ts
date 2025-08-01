import { model, Schema } from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
  {
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", default: null },
    pickupLocation: { type: String, required: true },
    destinationLocation: { type: String, required: true },
    fare: { type: Number, default: 0 },
    distanceInKm: { type: Number, default: 0 },
    durationInMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    requestedAt: { type: Date, default: Date.now },
    pickedUpAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const Ride = model<IRide>("Ride", rideSchema);
