import {
  CURRENT_SAVE_VERSION,
  type AirlineState,
} from "@/types/game";

export const STORAGE_KEY =
  "airline-executive-career-v1";

type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown,
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isFiniteNumber(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function hasCoreCareerFields(
  value: UnknownRecord,
) {
  const numberFields = [
    "week",
    "cash",
    "reputation",
    "loadFactor",
    "onTime",
    "aircraftCondition",
    "fuelIndex",
    "lastRevenue",
    "lastCosts",
    "lastProfit",
    "passengers",
  ];

  return (
    typeof value.airlineName === "string" &&
    typeof value.iata === "string" &&
    typeof value.icao === "string" &&
    isRecord(value.hub) &&
    isRecord(value.strategy) &&
    isRecord(value.aircraft) &&
    isRecord(value.route) &&
    numberFields.every((field) =>
      isFiniteNumber(value[field]),
    )
  );
}

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

export function migrateCareer(
  value: unknown,
): AirlineState | null {
  if (
    !isRecord(value) ||
    !hasCoreCareerFields(value)
  ) {
    return null;
  }

  const timestamp = new Date().toISOString();

  return {
    ...(value as unknown as AirlineState),
    saveVersion: CURRENT_SAVE_VERSION,
    careerId:
      typeof value.careerId === "string"
        ? value.careerId
        : createCareerId(),
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : timestamp,
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : timestamp,
    ceoName:
      typeof value.ceoName === "string" &&
      value.ceoName.trim()
        ? value.ceoName
        : "Chief Executive",
    ceoNationality:
      typeof value.ceoNationality === "string" &&
      value.ceoNationality.trim()
        ? value.ceoNationality
        : "Not specified",
    ceoAge: isFiniteNumber(value.ceoAge)
      ? value.ceoAge
      : 35,
    ceoBackground:
      typeof value.ceoBackground === "string" &&
      value.ceoBackground.trim()
        ? value.ceoBackground
        : "Airline founder",
  };
}

export function loadCareer(
  storage: Storage,
): AirlineState | null {
  const stored = storage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const career = migrateCareer(
      JSON.parse(stored) as unknown,
    );

    if (!career) {
      storage.removeItem(STORAGE_KEY);
    }

    return career;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveCareer(
  storage: Storage,
  game: AirlineState,
) {
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...game,
      saveVersion: CURRENT_SAVE_VERSION,
      updatedAt: new Date().toISOString(),
    }),
  );
}
