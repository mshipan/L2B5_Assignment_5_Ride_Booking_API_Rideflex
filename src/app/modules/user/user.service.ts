import AppError from "../../errorHelpers/AppError";
import {
  ApprovalStatus,
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { FilterQuery, SortOrder } from "mongoose";

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

const updateProfile = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, vehicleInfo, ...profileData } = payload;

  Object.assign(user, profileData);

  if (vehicleInfo) {
    user.vehicleInfo = {
      model: vehicleInfo.model ?? user.vehicleInfo?.model ?? "",
      plateNumber:
        vehicleInfo.plateNumber ?? user.vehicleInfo?.plateNumber ?? "",
    };
  }

  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return safeUser;
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

const getUsersForAdmin = async (query: {
  role?: Role;
  isActive?: IsActive;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}) => {
  const {
    role,
    isActive,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: FilterQuery<typeof User> = {};

  if (role) filter.role = role;
  if (isActive) filter.isActive = isActive;

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
    ];
  }

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    User.find(filter, { password: 0 })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const getUserByIdForAdmin = async (userId: string) => {
  const user = await User.findById(userId, { password: 0 });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }
  return user;
};

const updateUserIsActive = async (
  userId: string,
  isActive: IsActive,
  actingAdminId?: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot change status of SUPER_ADMIN."
    );
  }

  if (actingAdminId && user._id?.toString() === actingAdminId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot change your own account status."
    );
  }

  user.isActive = isActive;
  await user.save();

  const safe = user.toObject();

  delete safe.password;

  return safe;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

export const UserServices = {
  createUser,
  updateProfile,
  toggleDriverAvailablility,
  updateUserApprovalStatus,
  getUsersForAdmin,
  getUserByIdForAdmin,
  updateUserIsActive,
  getMe,
};
