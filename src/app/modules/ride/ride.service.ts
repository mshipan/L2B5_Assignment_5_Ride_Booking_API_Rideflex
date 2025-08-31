import { FilterQuery, isValidObjectId, SortOrder, Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";
import { IRide, RideStatus } from "./ride.interface";
import { Ride } from "./ride.model";
import httpStatus from "http-status-codes";
import { calculateFare } from "../../utils/calculateFare";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import dayjs from "dayjs";

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

const getRideById = async (rideId: string, user: JwtPayload) => {
  const ride = await Ride.findById(rideId).populate("rider").populate("driver");

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  if (
    (user.role === Role.RIDER && ride.rider?._id?.toString() !== user.userId) ||
    (user.role === Role.DRIVER && ride.driver?._id?.toString() !== user.userId)
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to view this ride."
    );
  }

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

const acceptRide = async (rideId: string, driverId: string) => {
  const existingRide = await Ride.findOne({
    driver: driverId,
    status: {
      $in: [RideStatus.ACCEPTED, RideStatus.PICKED_UP, RideStatus.IN_TRANSIT],
    },
  });

  if (existingRide) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have an ongoing ride."
    );
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  if (ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride is not available to accept."
    );
  }

  ride.driver = new Types.ObjectId(driverId);
  ride.status = RideStatus.ACCEPTED;
  ride.accepteddAt = new Date();

  await ride.save();

  return ride;
};

const pickupRide = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");

  if (ride.driver?.toString() !== driverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  }

  if (ride.status !== RideStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride is not ready to be picked up."
    );
  }

  ride.status = RideStatus.PICKED_UP;
  ride.pickedUpAt = new Date();

  await ride.save();
  return ride;
};

const startTransit = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");

  if (ride.driver?.toString() !== driverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  }

  if (ride.status !== RideStatus.PICKED_UP) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride is not picked up yet.");
  }

  ride.status = RideStatus.IN_TRANSIT;
  ride.transitStartedAt = new Date();

  await ride.save();
  return ride;
};

const completeRide = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride Not Found.");
  }

  if (ride.driver?.toString() !== driverId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not assigned to this ride."
    );
  }

  if (ride.status === RideStatus.CANCELLED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Canceled ride cannot be completed."
    );
  }

  if (ride.status !== RideStatus.IN_TRANSIT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride can not be completed because it is not in transit."
    );
  }

  const distance = ride.distanceInKm ?? 0;
  const duration = ride.durationInMinutes ?? 0;

  const fare = calculateFare({
    distanceInKm: distance,
    durationInMinutes: duration,
  });

  ride.status = RideStatus.COMPLETED;
  ride.completedAt = new Date();
  ride.fare = fare;

  await ride.save();

  return ride;
};

const cancelRide = async (rideId: string, userId: string, role: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  const isRider = role === Role.RIDER && ride.rider.toString() === userId;
  const isDriver = role === Role.DRIVER && ride.driver?.toString() === userId;

  if (!isRider && !isDriver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancle this ride."
    );
  }

  if (isRider && ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rider can only cancel when the ride is in 'REQUESTED' status."
    );
  }

  if (isDriver && ride.status === RideStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver cannot cancel a completed ride."
    );
  }

  ride.status = RideStatus.CANCELLED;
  ride.cancelledAt = new Date();

  await ride.save();

  return ride;
};

const cancelRideByDriver = async (rideId: string, driverId: string) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found.");
  }

  if (ride.driver?.toString() !== driverId.toString()) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to cancel this ride"
    );
  }

  if (
    ride.status === RideStatus.PICKED_UP ||
    ride.status === RideStatus.IN_TRANSIT ||
    ride.status === RideStatus.COMPLETED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot cancel a ride that is already in progress or completed"
    );
  }

  ride.driver = null;
  ride.status = RideStatus.REQUESTED;

  await ride.save();

  return ride;
};

const getAvailableRides = async () => {
  const rides = await Ride.find({ status: RideStatus.REQUESTED }).populate(
    "rider",
    "name phone"
  );

  if (!rides.length) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "No available rides at the moment."
    );
  }

  return rides;
};

const getAllRides = async () => {
  const rides = await Ride.find().populate("rider").populate("driver");

  if (!rides || rides.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found.");
  }

  return rides;
};

const getRiderRideHistory = async (riderId: string) => {
  if (!isValidObjectId(riderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid rider ID.");
  }

  const rider = await User.findById(riderId);

  if (!rider || rider.role !== Role.RIDER) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found.");
  }

  const rides = await Ride.find({ rider: riderId })
    .populate("driver", "name email phone")
    .sort({ createdAt: -1 });

  return rides;
};

const getDriverRideHistory = async (
  driverId: string,
  query: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "status";
    sortOrder?: "asc" | "desc";
  }
) => {
  if (!Types.ObjectId.isValid(driverId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid driver ID.");
  }

  const {
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter: FilterQuery<typeof Ride> = { driver: driverId };

  if (search) {
    filter.$or = [
      { pickupLocation: new RegExp(search, "i") },
      { destinationLocation: new RegExp(search, "i") },
      { status: new RegExp(search, "i") },
    ];
  }

  const sort: Record<string, SortOrder> = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  const [data, total] = await Promise.all([
    Ride.find(filter)
      .populate("rider", "name email phone")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Ride.countDocuments(filter),
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

const getDriverEarnings = async (driverId: string) => {
  if (!Types.ObjectId.isValid(driverId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid driver ID.");
  }

  const completedRides = await Ride.find({
    driver: driverId,
    status: RideStatus.COMPLETED,
  });

  const totalEarnings = completedRides.reduce(
    (sum, ride) => sum + (ride.fare || 0),
    0
  );

  return {
    totalEarnings,
    completedRides,
  };
};

const estimateFare = async (
  pickupLocation: string,
  destinationLocation: string
) => {
  if (!pickupLocation || !destinationLocation) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Pickup and destination locations are required."
    );
  }

  if (pickupLocation.trim() === destinationLocation.trim()) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Pickup and destination locations must be different."
    );
  }

  const distanceInKm = 10;
  const durationInMinutes = 20;

  const fare = calculateFare({ distanceInKm, durationInMinutes });

  return { distanceInKm, durationInMinutes, estimatedFare: fare };
};

const getDriverDashboard = async (driverId: string) => {
  if (!isValidObjectId(driverId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid driver ID");
  }

  const driver = await User.findById(driverId);

  if (!driver || driver.role !== Role.DRIVER) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  const totalRides = await Ride.countDocuments({ driver: driverId });

  const completedRides = await Ride.countDocuments({
    driver: driverId,
    status: "COMPLETED",
  });

  const cancelledRides = await Ride.countDocuments({
    driver: driverId,
    status: "CANCELLED",
  });

  const activeRides = await Ride.countDocuments({
    driver: driverId,
    status: { $in: ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  const todayStart = dayjs().startOf("day").toDate();
  const weekStart = dayjs().startOf("week").toDate();
  const monthStart = dayjs().startOf("month").toDate();

  const [todayEarnings, weekEarnings, monthEarnings, totalEarnings] =
    await Promise.all([
      Ride.aggregate([
        {
          $match: {
            driver: driver._id,
            status: "COMPLETED",
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            driver: driver._id,
            status: "COMPLETED",
            createdAt: { $gte: weekStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            driver: driver._id,
            status: "COMPLETED",
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            driver: driver._id,
            status: "COMPLETED",
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
    ]);

  return {
    earningsSummary: {
      today: todayEarnings[0]?.sum || 0,
      week: weekEarnings[0]?.sum || 0,
      month: monthEarnings[0]?.sum || 0,
      total: totalEarnings[0]?.sum || 0,
    },
    rideSummary: {
      total: totalRides,
      completed: completedRides,
      cancelled: cancelledRides,
      active: activeRides,
    },
    driverStatus: {
      isOnline: driver.isOnline ?? false,
    },
  };
};

const getRiderDashboard = async (riderId: string) => {
  if (!isValidObjectId(riderId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid rider ID");
  }

  const rider = await User.findById(riderId);

  if (!rider || rider.role !== Role.RIDER) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found");
  }

  const totalRides = await Ride.countDocuments({ rider: riderId });

  const completedRides = await Ride.countDocuments({
    rider: riderId,
    status: "COMPLETED",
  });

  const cancelledRides = await Ride.countDocuments({
    rider: riderId,
    status: "CANCELLED",
  });

  const activeRides = await Ride.countDocuments({
    rider: riderId,
    status: { $in: ["REQUESTED", "ACCEPTED", "IN_TRANSIT"] },
  });

  const todayStart = dayjs().startOf("day").toDate();
  const weekStart = dayjs().startOf("week").toDate();
  const monthStart = dayjs().startOf("month").toDate();

  const [todaySpending, weekSpending, monthSpending, totalSpending] =
    await Promise.all([
      Ride.aggregate([
        {
          $match: {
            rider: rider._id,
            status: "COMPLETED",
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            rider: rider._id,
            status: "COMPLETED",
            createdAt: { $gte: weekStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            rider: rider._id,
            status: "COMPLETED",
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: { rider: rider._id, status: "COMPLETED" },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
    ]);

  const recentRides = await Ride.find({ rider: riderId })
    .populate("driver", "name email phone")
    .sort({ createdAt: -1 })
    .limit(5);

  const activeRide = await Ride.findOne({
    rider: riderId,
    status: { $in: ["REQUESTED", "ACCEPTED", "IN_TRANSIT"] },
  }).populate("driver", "name email phone");

  return {
    rideSummary: {
      total: totalRides,
      completed: completedRides,
      cancelled: cancelledRides,
      active: activeRides,
    },
    spendingSummary: {
      today: todaySpending[0]?.sum || 0,
      week: weekSpending[0]?.sum || 0,
      month: monthSpending[0]?.sum || 0,
      total: totalSpending[0]?.sum || 0,
    },
    recentActivity: recentRides,
    riderStatus: {
      inActiveRide: !!activeRide,
      activeRideId: activeRide?._id || null,
    },
  };
};

const getAdminDashboard = async (adminId: string) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized as Admin.");
  }

  const totalRiders = await User.countDocuments({ role: Role.RIDER });
  const totalDrivers = await User.countDocuments({ role: Role.DRIVER });

  const activeDrivers = await User.countDocuments({
    role: Role.DRIVER,
    status: "APPROVED",
  });

  const suspendedDrivers = await User.countDocuments({
    role: Role.DRIVER,
    status: "SUSPENDED",
  });

  const blockedRiders = await User.countDocuments({
    role: Role.RIDER,
    status: "BLOCKED",
  });

  const totalRides = await Ride.countDocuments();
  const completedRides = await Ride.countDocuments({ status: "COMPLETED" });
  const cancelledRides = await Ride.countDocuments({ status: "CANCELLED" });
  const ongoingRides = await Ride.countDocuments({
    status: { $in: ["REQUESTED", "ACCEPTED", "IN_TRANSIT"] },
  });

  const todayStart = dayjs().startOf("day").toDate();
  const weekStart = dayjs().startOf("week").toDate();
  const monthStart = dayjs().startOf("month").toDate();

  const [todayRevenue, weekRevenue, monthRevenue, totalRevenue] =
    await Promise.all([
      Ride.aggregate([
        {
          $match: {
            status: "COMPLETED",
            createdAt: { $gte: todayStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            status: "COMPLETED",
            createdAt: { $gte: weekStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        {
          $match: {
            status: "COMPLETED",
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
      Ride.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, sum: { $sum: "$fare" } } },
      ]),
    ]);

  const topDriversByRides = await Ride.aggregate([
    { $match: { status: "COMPLETED" } },
    { $group: { _id: "$driver", rides: { $sum: 1 } } },
    { $sort: { rides: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "driver",
      },
    },
    { $unwind: "$driver" },
    { $project: { "driver.name": 1, rides: 1 } },
  ]);

  const topDriversByEarnings = await Ride.aggregate([
    { $match: { status: "COMPLETED" } },
    { $group: { _id: "$driver", earnings: { $sum: "$fare" } } },
    { $sort: { earnings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "driver",
      },
    },
    { $unwind: "$driver" },
    { $project: { "driver.name": 1, earnings: 1 } },
  ]);

  const recentRides = await Ride.find()
    .populate("rider", "name email")
    .populate("driver", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    userSummary: {
      totalRiders,
      totalDrivers,
      activeDrivers,
      suspendedDrivers,
      blockedRiders,
    },
    rideSummary: {
      totalRides,
      completedRides,
      cancelledRides,
      ongoingRides,
    },
    revenueSummary: {
      today: todayRevenue[0]?.sum || 0,
      week: weekRevenue[0]?.sum || 0,
      month: monthRevenue[0]?.sum || 0,
      total: totalRevenue[0]?.sum || 0,
    },
    driverActivity: {
      topDriversByRides,
      topDriversByEarnings,
    },
    recentActivity: recentRides,
  };
};

export const RideServices = {
  createRide,
  getRideById,
  getMyRides,
  acceptRide,
  pickupRide,
  startTransit,
  completeRide,
  cancelRide,
  cancelRideByDriver,
  getAvailableRides,
  getAllRides,
  getRiderRideHistory,
  getDriverRideHistory,
  getDriverEarnings,
  estimateFare,
  getDriverDashboard,
  getRiderDashboard,
  getAdminDashboard,
};
