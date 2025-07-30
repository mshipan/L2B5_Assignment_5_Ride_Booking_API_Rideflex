import { z } from "zod";
import { ApprovalStatus, IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
  // ✅ Basic Info
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string.",
    })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Invalid email format." }),

  password: z
    .string({
      required_error: "Password is required.",
      invalid_type_error: "Password must be a string.",
    })
    .min(6, { message: "Password must be at least 6 characters long." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, {
      message: "Must contain at least one special character.",
    })
    .optional(),

  phone: z
    .string({ invalid_type_error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  picture: z
    .string({
      invalid_type_error: "Picture URL must be a string.",
    })
    .url({ message: "Picture must be a valid URL." })
    .optional(),

  address: z
    .string({
      invalid_type_error: "Address must be a string.",
    })
    .max(200, { message: "Address can't exceed 200 characters." })
    .optional(),

  // ✅ Status Flags
  isDeleted: z
    .boolean({
      invalid_type_error: "isDeleted must be a boolean.",
    })
    .optional(),

  isActive: z
    .enum([IsActive.ACTIVE, IsActive.INACTIVE, IsActive.BLOCKED], {
      invalid_type_error: "isActive must be one of: ACTIVE, INACTIVE, BLOCKED.",
    })
    .optional(),

  isVerified: z
    .boolean({
      required_error: "isVerified is required.",
      invalid_type_error: "isVerified must be a boolean.",
    })
    .optional(),

  // ✅ Role & Auth
  role: z
    .enum([Role.SUPER_ADMIN, Role.ADMIN, Role.RIDER, Role.DRIVER], {
      required_error: "Role is required.",
      invalid_type_error: "Role must be a valid enum value.",
    })
    .optional(),

  auths: z
    .array(
      z.object({
        provider: z.enum(["google", "credentials"], {
          required_error: "Auth provider is required.",
          invalid_type_error:
            "Provider must be either 'google' or 'credentials'.",
        }),
        providerId: z.string({
          required_error: "Provider ID is required.",
          invalid_type_error: "Provider ID must be a string.",
        }),
      })
    )
    .min(1, { message: "At least one auth provider is required." })
    .optional(),

  // ✅ Rider-Specific Fields
  requestedRides: z
    .array(
      z.string({
        invalid_type_error: "Each requested ride ID must be a string.",
      })
    )
    .optional(),

  // ✅ Driver-Specific Fields
  acceptedRides: z
    .array(
      z.string({
        invalid_type_error: "Each accepted ride ID must be a string.",
      })
    )
    .optional(),

  vehicleInfo: z
    .object({
      model: z.string({
        required_error: "Vehicle model is required.",
        invalid_type_error: "Vehicle model must be a string.",
      }),
      plateNumber: z.string({
        required_error: "Plate number is required.",
        invalid_type_error: "Plate number must be a string.",
      }),
    })
    .partial()
    .optional(),

  isOnline: z
    .boolean({
      invalid_type_error: "isOnline must be a boolean.",
    })
    .optional(),

  approvalStatus: z
    .enum(
      [
        ApprovalStatus.PENDING,
        ApprovalStatus.APPROVED,
        ApprovalStatus.SUSPENDED,
      ],
      {
        invalid_type_error: "approvalStatus must be a valid enum value.",
      }
    )
    .optional(),
});
