/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import {
  ApprovalStatus,
  IAuthProvider,
  IDriver,
  IRider,
  IUser,
  Role,
} from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role = Role.RIDER, ...rest } = payload;

  if (!email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email and password are required."
    );
  }

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User Already Exists.");
  }

  const hashedPassword = await bcrypt.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const commonUser = {
    ...rest,
    email,
    password: hashedPassword,
    role,
    auths: [authProvider],
  };

  let finalData: any = { ...commonUser };

  if (role === Role.RIDER) {
    const riderData: IRider = {
      ...finalData,
      requestedRideId: null,
      rideHistory: [],
    };
    finalData = riderData;
  } else if (role === Role.DRIVER) {
    const driverData: IDriver = {
      ...finalData,
      approvalStatus: ApprovalStatus.PENDING,
      isOnline: false,
      currentRideId: null,
      acceptedRideHistory: [],
      earnings: 0,
      vehicleInfo: (payload as Partial<IDriver>).vehicleInfo,
    };
    finalData = driverData;
  }

  const user = new User(finalData);
  await user.save();

  return user;
};

export const UserServices = { createUser };
