import { FareCalculationInput } from "../interfaces";

export const calculateFare = ({
  distanceInKm,
  durationInMinutes,
}: FareCalculationInput): number => {
  const baseFare = 50;
  const perKmRate = 20;
  const perMinuteRate = 2;

  const fare =
    baseFare + distanceInKm * perKmRate + durationInMinutes * perMinuteRate;

  return Math.round(fare);
};
