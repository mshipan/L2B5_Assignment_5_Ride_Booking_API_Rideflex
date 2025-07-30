import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  RIDER = "RIDER",
  DRIVER = "DRIVER",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}

export interface IAuthProvider {
  provider: "credentials";
  providerId: string;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: Role;
  phone?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified: boolean;
  auths: IAuthProvider[];
}

export interface IRider extends IUser {
  role: Role.RIDER;
  requestedRideId?: string | null;
  rideHistory?: Types.ObjectId[];
}

export interface IDriver extends IUser {
  role: Role.DRIVER;
  approvalStatus?: ApprovalStatus;
  isOnline?: boolean;
  currentRideId?: string | null;
  acceptedRideHistory?: Types.ObjectId[];
  earnings?: number;
  vehicleInfo?: {
    model: string;
    plateNumber: string;
  };
}

export interface IAdmin extends IUser {
  role: Role.ADMIN;
}
