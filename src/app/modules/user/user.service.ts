import AppError from "../../errorHelpers/AppError";
import { ApprovalStatus, IAuthProvider, IUser, Role } from "./user.interface";
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

  const userData: Partial<IUser> = {
    ...rest,
    email,
    password: hashedPassword,
    role,
    auths: [authProvider],
  };

  const user = new User(userData);
  await user.save();

  return user;
};

const toggleDriverAvailablility = async (
  driverId: string,
  isOnline: boolean
) => {
  const driver = await User.findOne({
    _id: driverId,
    role: Role.DRIVER,
    isDeleted: false,
  });

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found.");
  }

  if (driver.approvalStatus !== ApprovalStatus.APPROVED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Driver not approved to go online."
    );
  }

  driver.isOnline = isOnline;
  await driver.save();

  return driver;
};

const updateUserApprovalStatus = async (
  userId: string,
  approvalStatus: ApprovalStatus
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user.role !== Role.DRIVER && user.role !== Role.RIDER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Approval status can only be changed for Drivers or Riders."
    );
  }

  user.approvalStatus = approvalStatus;

  await user.save();

  return user;
};

export const UserServices = {
  createUser,
  toggleDriverAvailablility,
  updateUserApprovalStatus,
};
