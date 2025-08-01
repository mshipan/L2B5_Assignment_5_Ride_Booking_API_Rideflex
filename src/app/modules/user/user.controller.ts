/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

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

export const UserController = {
  createUser,
  setDriverOnlineStatus,
  updateUserApprovalStatus,
};
