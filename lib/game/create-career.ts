import type {
  Aircraft,
  Hub,
  RouteSeed,
  Strategy,
} from "@/lib/game-data";
import {
  CURRENT_SAVE_VERSION,
  type AirlineState,
} from "@/types/game";

export type CreateCareerInput = {
  airlineName: string;
  ceoName: string;
  ceoNationality: string;
  ceoAge: number;
  ceoBackground: string;
  iata: string;
  icao: string;
  hub: Hub;
  strategy: Strategy;
  aircraft: Aircraft;
  route: RouteSeed;
};

function createCareerId() {
  if (
    typeof globalThis.crypto?.randomUUID ===
    "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `career-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createInitialCareer({
  airlineName,
  ceoName,
  ceoNationality,
  ceoAge,
  ceoBackground,
  iata,
  icao,
  hub,
  strategy,
  aircraft,
  route,
}: CreateCareerInput): AirlineState {
  const initialCash =
    strategy.capital -
    aircraft.monthlyLease * 3 -
    4_800_000;

  const initialLoad = Math.round(
    Math.min(
      84,
      route.demand *
        0.76 *
        strategy.demandMultiplier,
    ),
  );

  const sectors = route.weeklyFlights * 2;

  const passengers = Math.round(
    sectors *
      aircraft.seats *
      (initialLoad / 100),
  );

  const revenue =
    passengers *
    route.baseFare *
    strategy.fareMultiplier;

  const variable =
    sectors *
    route.distance *
    aircraft.fuelBurn *
    10.8;

  const costs =
    variable +
    aircraft.monthlyLease / 4.33 +
    sectors * 31_000 +
    690_000;

  const timestamp = new Date().toISOString();

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    careerId: createCareerId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    airlineName:
      airlineName.trim() || "Aurelia Air",
    ceoName: ceoName.trim(),
    ceoNationality: ceoNationality.trim(),
    ceoAge,
    ceoBackground: ceoBackground.trim(),
    iata: iata.toUpperCase(),
    icao: icao.toUpperCase(),
    hub,
    strategy,
    aircraft,
    route,
    week: 1,
    cash: initialCash,
    reputation: 50,
    loadFactor: initialLoad,
    onTime: 91.4,
    aircraftCondition: 100,
    fuelIndex: 104.6,
    lastRevenue: revenue,
    lastCosts: costs,
    lastProfit: revenue - costs,
    passengers,
  };
}
