import type { AirlineState } from "@/types/game";
import { processAuctionDecisions } from "@/lib/game/auctions";

export const GAME_MINUTES_PER_REAL_SECOND =
  1 / 60;

const INITIAL_GAME_TIME = Date.UTC(
  2026,
  8,
  6,
  8,
  0,
  0,
);
const GAME_WEEK_MILLISECONDS =
  7 * 24 * 60 * 60 * 1_000;

export type WeekResult = {
  game: AirlineState;
  week: number;
  passengers: number;
  loadFactor: number;
  profit: number;
};

export function advanceCareerClock(
  currentGame: AirlineState,
  gameMinutes: number,
) {
  if (
    !Number.isFinite(gameMinutes) ||
    gameMinutes <= 0
  ) {
    return currentGame;
  }

  const parsedGameTime = Date.parse(
    currentGame.gameDateTime,
  );
  const currentGameTime = Number.isFinite(
    parsedGameTime,
  )
    ? parsedGameTime
    : INITIAL_GAME_TIME;
  const nextGameTime =
    currentGameTime +
    gameMinutes * 60 * 1_000;
  const targetWeek = Math.max(
    1,
    Math.floor(
      (nextGameTime - INITIAL_GAME_TIME) /
        GAME_WEEK_MILLISECONDS,
    ) + 1,
  );

  let nextGame = currentGame;

  while (nextGame.week < targetWeek) {
    nextGame = advanceCareerWeek(nextGame).game;
  }

  return processAuctionDecisions({
    ...nextGame,
    gameDateTime: new Date(
      nextGameTime,
    ).toISOString(),
    updatedAt: new Date().toISOString(),
  }, new Date(nextGameTime).toISOString());
}

export function advanceCareerWeek(
  currentGame: AirlineState,
): WeekResult {
  const nextWeek = currentGame.week + 1;

  if (!currentGame.aircraft || !currentGame.route) {
    return {
      game: {
        ...currentGame,
        updatedAt: new Date().toISOString(),
        week: nextWeek,
        passengers: 0,
        loadFactor: 0,
        lastRevenue: 0,
        lastCosts: 0,
        lastProfit: 0,
      },
      week: nextWeek,
      passengers: 0,
      loadFactor: 0,
      profit: 0,
    };
  }

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

  const monthlyAircraftCommitments =
    currentGame.fleet.reduce(
      (total, item) =>
        total + item.monthlyPayment,
      0,
    );
  const legacyMonthlyLease =
    currentGame.fleet.length === 0
      ? currentGame.aircraft.monthlyLease
      : 0;
  const weeklyAircraftCommitments =
    (monthlyAircraftCommitments +
      legacyMonthlyLease) /
    4.33;

  const costs =
    fuelCost +
    weeklyAircraftCommitments +
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
