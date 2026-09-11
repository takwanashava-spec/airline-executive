import type { AirlineState } from "@/types/game";

export type WeekResult = {
  game: AirlineState;
  week: number;
  passengers: number;
  loadFactor: number;
  profit: number;
};

export function advanceCareerWeek(
  currentGame: AirlineState,
): WeekResult {
  if (!currentGame.aircraft || !currentGame.route) {
    return {
      game: currentGame,
      week: currentGame.week,
      passengers: 0,
      loadFactor: 0,
      profit: 0,
    };
  }

  const nextWeek = currentGame.week + 1;

  const demandWave =
    Math.sin(nextWeek * 1.47) * 2.8;

  const operationalNoise =
    Math.cos(nextWeek * 0.91) * 1.9;

  const nextLoad = Math.max(
    42,
    Math.min(
      94,
      Math.round(
        currentGame.loadFactor +
          1.4 +
          demandWave,
      ),
    ),
  );

  const nextOnTime = Math.max(
    81,
    Math.min(
      98.5,
      currentGame.onTime + operationalNoise,
    ),
  );

  const fuelIndex = Math.max(
    92,
    Math.min(
      124,
      currentGame.fuelIndex +
        Math.sin(nextWeek) * 2.1,
    ),
  );

  const sectors =
    currentGame.route.weeklyFlights * 2;

  const passengers = Math.round(
    sectors *
      currentGame.aircraft.seats *
      (nextLoad / 100),
  );

  const revenue =
    passengers *
    currentGame.route.baseFare *
    currentGame.strategy.fareMultiplier;

  const fuelCost =
    sectors *
    currentGame.route.distance *
    currentGame.aircraft.fuelBurn *
    10.8 *
    (fuelIndex / 100);

  const costs =
    fuelCost +
    currentGame.aircraft.monthlyLease / 4.33 +
    sectors * 31_000 +
    690_000 +
    (nextOnTime < 87 ? 210_000 : 0);

  const profit = revenue - costs;

  return {
    week: nextWeek,
    passengers,
    loadFactor: nextLoad,
    profit,
    game: {
      ...currentGame,
      updatedAt: new Date().toISOString(),
      week: nextWeek,
      cash: currentGame.cash + profit,
      reputation: Math.max(
        0,
        Math.min(
          100,
          currentGame.reputation +
            (nextOnTime >= 90 ? 1 : -1),
        ),
      ),
      loadFactor: nextLoad,
      onTime: nextOnTime,
      aircraftCondition: Math.max(
        72,
        currentGame.aircraftCondition - 0.65,
      ),
      fuelIndex,
      lastRevenue: revenue,
      lastCosts: costs,
      lastProfit: profit,
      passengers,
    },
  };
}
