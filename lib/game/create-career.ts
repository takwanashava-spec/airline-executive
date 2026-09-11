import type {
  Hub,
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
}: CreateCareerInput): AirlineState {
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
    aircraft: null,
    route: null,
    week: 1,
    cash: strategy.capital,
    reputation: 50,
    loadFactor: 0,
    onTime: 100,
    aircraftCondition: 0,
    fuelIndex: 104.6,
    lastRevenue: 0,
    lastCosts: 0,
    lastProfit: 0,
    passengers: 0,
  };
}
