import { model, Schema } from "mongoose";
import {
  ApprovalStatus,
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(Role), default: Role.RIDER },
    auths: [authProviderSchema],
    // requestedRides: [{ type: Types.ObjectId, ref: "Ride" }],
    // acceptedRides: [{ type: Types.ObjectId, ref: "Ride" }],
    vehicleInfo: {
      model: { type: String },
      plateNumber: { type: String },
    },
    isOnline: { type: Boolean },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
