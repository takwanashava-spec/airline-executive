import type {
  Aircraft,
  Hub,
  RouteSeed,
  Strategy,
} from "@/lib/game-data";

export const CURRENT_SAVE_VERSION = 4;

export type GameSpeed = 0 | 1 | 60 | 360;

export type View =
  | "overview"
  | "network"
  | "fleet"
  | "finance";

export type AirlineState = {
  saveVersion: number;
  careerId: string;
  createdAt: string;
  updatedAt: string;
  airlineName: string;
  ceoName: string;
  ceoNationality: string;
  ceoAge: number;
  ceoBackground: string;
  iata: string;
  icao: string;
  hub: Hub;
  strategy: Strategy;
  aircraft: Aircraft | null;
  route: RouteSeed | null;
  gameDateTime: string;
  week: number;
  cash: number;
  reputation: number;
  loadFactor: number;
  onTime: number;
  aircraftCondition: number;
  fuelIndex: number;
  lastRevenue: number;
  lastCosts: number;
  lastProfit: number;
  passengers: number;
};
