import {
  aircraft,
  aircraftPurchasePrices,
} from "@/lib/game-data";
import type {
  AirlineState,
  FleetAircraft,
} from "@/types/game";

const REGISTRATION_PREFIXES: Record<
  string,
  string
> = {
  AE: "A6",
  AU: "VH",
  CA: "C",
  GB: "G",
  JP: "JA",
  SG: "9V",
  US: "N",
  ZA: "ZS",
  ZW: "Z",
};

export type AircraftPurchaseResult = {
  game: AirlineState;
  aircraft: FleetAircraft | null;
  error: string | null;
};

function createAircraftId() {
  if (
    typeof globalThis.crypto?.randomUUID ===
    "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `aircraft-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function createRegistration(
  game: AirlineState,
) {
  const prefix =
    REGISTRATION_PREFIXES[
      game.hub.countryCode ?? ""
    ] ?? game.icao.slice(0, 2);
  const sequence = String(
    game.fleet.length + 1,
  ).padStart(3, "0");

  return `${prefix}-${sequence}`;
}

export function purchaseAircraft(
  currentGame: AirlineState,
  model: string,
): AircraftPurchaseResult {
  const selectedAircraft = aircraft.find(
    (item) => item.model === model,
  );

  if (!selectedAircraft) {
    return {
      game: currentGame,
      aircraft: null,
      error: "Aircraft is not available in the market.",
    };
  }

  const purchasePrice =
    aircraftPurchasePrices[
      selectedAircraft.model
    ];

  if (!Number.isFinite(purchasePrice)) {
    return {
      game: currentGame,
      aircraft: null,
      error: "Aircraft pricing is unavailable.",
    };
  }

  if (currentGame.cash < purchasePrice) {
    return {
      game: currentGame,
      aircraft: null,
      error: "The airline does not have enough cash for this purchase.",
    };
  }

  const acquiredAircraft: FleetAircraft = {
    id: createAircraftId(),
    registration:
      createRegistration(currentGame),
    aircraft: selectedAircraft,
    acquiredAt: currentGame.gameDateTime,
    purchasePrice,
    condition: 100,
    status: "parked",
  };

  return {
    aircraft: acquiredAircraft,
    error: null,
    game: {
      ...currentGame,
      updatedAt: new Date().toISOString(),
      cash: currentGame.cash - purchasePrice,
      aircraft:
        currentGame.aircraft ??
        selectedAircraft,
      aircraftCondition:
        currentGame.aircraftCondition || 100,
      fleet: [
        ...currentGame.fleet,
        acquiredAircraft,
      ],
    },
  };
}
