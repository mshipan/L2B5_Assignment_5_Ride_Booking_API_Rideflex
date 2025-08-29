/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IsActive, Role } from "./user.interface";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const actingUser = req.user as JwtPayload;
  const targetUserId = req.params.id || actingUser.userId;

  const updatedUser = await UserServices.updateProfile(targetUserId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Profile Updated Successfully",
    data: updatedUser,
  });
});

const setDriverOnlineStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const userId = user.userId;
    const { isOnline } = req.body;

    const result = await UserServices.toggleDriverAvailablility(
      userId,
      isOnline
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Driver is now ${isOnline ? "Online" : "Offline"}`,
      data: result,
    });
  }
);

const updateUserApprovalStatus = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.params.id;

    const { approvalStatus } = req.body;

    const updatedUser = await UserServices.updateUserApprovalStatus(
      userId,
      approvalStatus
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Approval status updated successfully.",
      data: updatedUser,
    });
  }
);

const getUsersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUsersForAdmin({
    role: req.query.role as Role,
    isActive: req.query.isActive as IsActive,
    search: req.query.search as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    sortBy: req.query.sortBy as "createdAt" | "name" | "email" | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users fetched successfully.",
    data: result.data,
    meta: result.meta,
  });
});

const getUserByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.getUserByIdForAdmin(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User fetched successfully.",
    data: user,
  });
});

const updateUserIsActive = catchAsync(async (req: Request, res: Response) => {
  const admin = req.user as JwtPayload | undefined;

  const updated = await UserServices.updateUserIsActive(
    req.params.id,
    req.body.isActive,
    admin?.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User status updated successfully.",
    data: updated,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const result = await UserServices.getMe(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your profile retrieved successfully",
    data: result.data,
  });
});

export const UserController = {
  createUser,
  updateProfile,
  setDriverOnlineStatus,
  updateUserApprovalStatus,
  getUsersForAdmin,
  getUserByIdForAdmin,
  updateUserIsActive,
  getMe,
};
