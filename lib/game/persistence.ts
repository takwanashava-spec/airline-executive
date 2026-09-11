import {
  CURRENT_SAVE_VERSION,
  type AirlineState,
  type FleetAircraft,
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

function migrateFleetAircraft(
  value: unknown,
  index: number,
  fallbackDate: string,
): FleetAircraft | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.registration !== "string" ||
    !isRecord(value.aircraft)
  ) {
    return null;
  }

  const purchasePrice = isFiniteNumber(
    value.purchasePrice,
  )
    ? value.purchasePrice
    : 0;
  const acquisitionType =
    value.acquisitionType === "owned" ||
    value.acquisitionType === "leased" ||
    value.acquisitionType === "financed"
      ? value.acquisitionType
      : purchasePrice > 0
        ? "owned"
        : "leased";
  const market =
    value.market === "new" ||
    value.market === "used" ||
    value.market === "lessor"
      ? value.market
      : acquisitionType === "leased"
        ? "lessor"
        : "new";
  const legacyMonthlyLease =
    isFiniteNumber(
      value.aircraft.monthlyLease,
    )
      ? value.aircraft.monthlyLease
      : 0;

  return {
    ...(value as unknown as FleetAircraft),
    id:
      value.id ||
      `aircraft-${index + 1}`,
    registration: value.registration,
    aircraft:
      value.aircraft as unknown as FleetAircraft["aircraft"],
    acquiredAt:
      typeof value.acquiredAt === "string"
        ? value.acquiredAt
        : fallbackDate,
    purchasePrice,
    condition: isFiniteNumber(value.condition)
      ? value.condition
      : 100,
    status:
      value.status === "active" ||
      value.status === "maintenance"
        ? value.status
        : "parked",
    acquisitionType,
    market,
    provider:
      typeof value.provider === "string"
        ? value.provider
        : acquisitionType === "leased"
          ? "Legacy lease contract"
          : "Aircraft market",
    monthlyPayment: isFiniteNumber(
      value.monthlyPayment,
    )
      ? value.monthlyPayment
      : acquisitionType === "leased"
        ? legacyMonthlyLease
        : 0,
    outstandingBalance: isFiniteNumber(
      value.outstandingBalance,
    )
      ? value.outstandingBalance
      : 0,
    manufactureYear: isFiniteNumber(
      value.manufactureYear,
    )
      ? value.manufactureYear
      : 2026,
    flightHours: isFiniteNumber(
      value.flightHours,
    )
      ? value.flightHours
      : 0,
  };
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
    (value.aircraft === null ||
      isRecord(value.aircraft)) &&
    (value.route === null ||
      isRecord(value.route)) &&
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
  const legacyWeek = isFiniteNumber(value.week)
    ? Math.max(1, Math.floor(value.week))
    : 1;
  const fallbackGameDate = new Date(
    Date.UTC(
      2026,
      8,
      6 + (legacyWeek - 1) * 7,
      8,
      0,
      0,
    ),
  ).toISOString();
  const gameDateTime =
    typeof value.gameDateTime === "string" &&
    Number.isFinite(
      Date.parse(value.gameDateTime),
    )
      ? value.gameDateTime
      : fallbackGameDate;

  const legacyAircraft = isRecord(
    value.aircraft,
  )
    ? value.aircraft
    : null;
  const fleet: FleetAircraft[] =
    Array.isArray(value.fleet)
      ? value.fleet
          .map((item, index) =>
            migrateFleetAircraft(
              item,
              index,
              gameDateTime,
            ),
          )
          .filter(
            (
              item,
            ): item is FleetAircraft =>
              item !== null,
          )
      : legacyAircraft
        ? [
            {
              id: "legacy-aircraft-001",
              registration: `${value.icao}-001`,
              aircraft:
                legacyAircraft as unknown as FleetAircraft["aircraft"],
              acquiredAt: gameDateTime,
              purchasePrice: 0,
              condition: isFiniteNumber(
                value.aircraftCondition,
              )
                ? value.aircraftCondition
                : 100,
              status: isRecord(value.route)
                ? "active"
                : "parked",
              acquisitionType: "leased",
              market: "lessor",
              provider: "Legacy lease contract",
              monthlyPayment:
                isFiniteNumber(
                  legacyAircraft.monthlyLease,
                )
                  ? legacyAircraft.monthlyLease
                  : 0,
              outstandingBalance: 0,
              manufactureYear: 2026,
              flightHours: 0,
            },
          ]
        : [];

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
    gameDateTime,
    fleet,
    inbox: Array.isArray(value.inbox)
      ? (value.inbox as AirlineState["inbox"])
      : [],
    auctionBids: Array.isArray(value.auctionBids)
      ? (value.auctionBids as AirlineState["auctionBids"])
      : [],
    leaseApplications: Array.isArray(value.leaseApplications)
      ? (value.leaseApplications as AirlineState["leaseApplications"])
      : [],
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
