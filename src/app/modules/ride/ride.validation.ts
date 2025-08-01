import { z } from "zod";

export const createRideZodSchema = z.object({
  pickupLocation: z.string({
    invalid_type_error: "Pickup Location must be a string.",
  }),
  destinationLocation: z.string({
    invalid_type_error: "Destination Location must be a string.",
  }),
  fare: z.number().optional(),
});
