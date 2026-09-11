import {
  aircraft,
  aircraftManufacturers,
  aircraftPurchasePrices,
  type Aircraft,
  type AircraftManufacturerId,
} from "@/lib/game-data";
import type {
  AircraftAcquisitionType,
  AircraftMarket,
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

export type AircraftAcquisitionMethod =
  | "cash"
  | "finance"
  | "lease";

export type AircraftMarketOffer = {
  id: string;
  market: AircraftMarket;
  manufacturer: AircraftManufacturerId;
  aircraft: Aircraft;
  provider: string;
  manufactureYear: number;
  flightHours: number;
  condition: number;
  cashPrice: number;
  monthlyLease: number;
  financeDeposit: number;
  financeMonthlyPayment: number;
  financeTermMonths: number;
  financeAnnualRate: number;
};

export type AircraftAcquisitionResult = {
  game: AirlineState;
  aircraft: FleetAircraft | null;
  error: string | null;
};

function manufacturerOf(item: Aircraft) {
  return (
    aircraftManufacturers.find(
      (manufacturer) =>
        manufacturer.id ===
        item.manufacturerId,
    ) ?? aircraftManufacturers[0]
  );
}

function aircraftByModel(model: string) {
  return aircraft.find(
    (item) => item.model === model,
  );
}

function monthlyFinancePayment(
  principal: number,
  annualRate: number,
  months: number,
) {
  const monthlyRate = annualRate / 12;

  return Math.round(
    (principal *
      monthlyRate *
      (1 + monthlyRate) ** months) /
      ((1 + monthlyRate) ** months - 1),
  );
}

function financeTerms(
  price: number,
  market: "new" | "used",
) {
  const depositRate =
    market === "new" ? 0.2 : 0.25;
  const annualRate =
    market === "new" ? 0.085 : 0.105;
  const months = market === "new" ? 120 : 60;
  const deposit = Math.round(
    price * depositRate,
  );
  const financedAmount = price - deposit;

  return {
    deposit,
    months,
    annualRate,
    monthlyPayment: monthlyFinancePayment(
      financedAmount,
      annualRate,
      months,
    ),
  };
}

const usedOfferDetails = [
  {
    model: "ATR 72-600",
    provider: "Regional Aircraft Exchange",
    manufactureYear: 2018,
    flightHours: 18_400,
    condition: 82,
    cashPrice: 34_000_000,
  },
  {
    model: "Embraer E195-E2",
    provider: "Continental Aircraft Exchange",
    manufactureYear: 2021,
    flightHours: 10_800,
    condition: 88,
    cashPrice: 73_000_000,
  },
  {
    model: "Airbus A220-300",
    provider: "Global Airframe Exchange",
    manufactureYear: 2022,
    flightHours: 8_900,
    condition: 91,
    cashPrice: 96_000_000,
  },
] as const;

const lessorOfferDetails = [
  {
    model: "ATR 72-600",
    provider: "Nordic Regional Leasing",
    manufactureYear: 2022,
    flightHours: 6_200,
    condition: 95,
  },
  {
    model: "Embraer E195-E2",
    provider: "Horizon Aircraft Leasing",
    manufactureYear: 2023,
    flightHours: 4_700,
    condition: 97,
  },
  {
    model: "Airbus A220-300",
    provider: "Meridian Aviation Capital",
    manufactureYear: 2023,
    flightHours: 4_100,
    condition: 97,
  },
] as const;

const newOffers: AircraftMarketOffer[] =
  aircraft.map((item) => {
    const cashPrice =
      aircraftPurchasePrices[item.model];
    const finance = financeTerms(
      cashPrice,
      "new",
    );
    const manufacturer =
      manufacturerOf(item);

    return {
      id: `new-${item.model}`,
      market: "new",
      manufacturer: manufacturer.id,
      aircraft: item,
      provider: manufacturer.fullName,
      manufactureYear: 2026,
      flightHours: 0,
      condition: 100,
      cashPrice,
      monthlyLease: 0,
      financeDeposit: finance.deposit,
      financeMonthlyPayment:
        finance.monthlyPayment,
      financeTermMonths: finance.months,
      financeAnnualRate:
        finance.annualRate,
    };
  });

const usedOffers: AircraftMarketOffer[] =
  usedOfferDetails.flatMap((detail) => {
    const item = aircraftByModel(
      detail.model,
    );

    if (!item) return [];

    const finance = financeTerms(
      detail.cashPrice,
      "used",
    );

    return [
      {
        id: `used-${item.model}`,
        market: "used" as const,
        manufacturer: item.manufacturerId,
        aircraft: item,
        provider: detail.provider,
        manufactureYear:
          detail.manufactureYear,
        flightHours: detail.flightHours,
        condition: detail.condition,
        cashPrice: detail.cashPrice,
        monthlyLease: 0,
        financeDeposit: finance.deposit,
        financeMonthlyPayment:
          finance.monthlyPayment,
        financeTermMonths:
          finance.months,
        financeAnnualRate:
          finance.annualRate,
      },
    ];
  });

const lessorOffers: AircraftMarketOffer[] =
  lessorOfferDetails.flatMap((detail) => {
    const item = aircraftByModel(
      detail.model,
    );

    if (!item) return [];

    return [
      {
        id: `lessor-${item.model}`,
        market: "lessor" as const,
        manufacturer: item.manufacturerId,
        aircraft: item,
        provider: detail.provider,
        manufactureYear:
          detail.manufactureYear,
        flightHours: detail.flightHours,
        condition: detail.condition,
        cashPrice: 0,
        monthlyLease: item.monthlyLease,
        financeDeposit: 0,
        financeMonthlyPayment: 0,
        financeTermMonths: 0,
        financeAnnualRate: 0,
      },
    ];
  });

export const aircraftMarketOffers = [
  ...newOffers,
  ...usedOffers,
  ...lessorOffers,
];

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

export function acquireAircraft(
  currentGame: AirlineState,
  offerId: string,
  method: AircraftAcquisitionMethod,
): AircraftAcquisitionResult {
  const offer = aircraftMarketOffers.find(
    (item) => item.id === offerId,
  );

  if (!offer) {
    return {
      game: currentGame,
      aircraft: null,
      error: "Aircraft offer is no longer available.",
    };
  }

  if (
    offer.market === "new" &&
    offer.aircraft.availability ===
      "development"
  ) {
    return {
      game: currentGame,
      aircraft: null,
      error:
        "This aircraft programme is not yet available for immediate delivery.",
    };
  }

  const methodAllowed =
    (offer.market === "lessor" &&
      method === "lease") ||
    (offer.market !== "lessor" &&
      (method === "cash" ||
        method === "finance"));

  if (!methodAllowed) {
    return {
      game: currentGame,
      aircraft: null,
      error: "That acquisition method is not available for this offer.",
    };
  }

  const upfrontCost =
    method === "cash"
      ? offer.cashPrice
      : method === "finance"
        ? offer.financeDeposit
        : offer.monthlyLease * 3;

  if (currentGame.cash < upfrontCost) {
    return {
      game: currentGame,
      aircraft: null,
      error: "The airline does not have enough cash for the required upfront payment.",
    };
  }

  const acquisitionType: AircraftAcquisitionType =
    method === "cash"
      ? "owned"
      : method === "finance"
        ? "financed"
        : "leased";
  const monthlyPayment =
    method === "finance"
      ? offer.financeMonthlyPayment
      : method === "lease"
        ? offer.monthlyLease
        : 0;
  const outstandingBalance =
    method === "finance"
      ? offer.cashPrice -
        offer.financeDeposit
      : 0;

  const acquiredAircraft: FleetAircraft = {
    id: createAircraftId(),
    registration:
      createRegistration(currentGame),
    aircraft: offer.aircraft,
    acquiredAt: currentGame.gameDateTime,
    purchasePrice: offer.cashPrice,
    condition: offer.condition,
    status: "parked",
    acquisitionType,
    market: offer.market,
    provider: offer.provider,
    monthlyPayment,
    outstandingBalance,
    manufactureYear:
      offer.manufactureYear,
    flightHours: offer.flightHours,
  };

  return {
    aircraft: acquiredAircraft,
    error: null,
    game: {
      ...currentGame,
      updatedAt: new Date().toISOString(),
      cash: currentGame.cash - upfrontCost,
      aircraft:
        currentGame.aircraft ??
        offer.aircraft,
      aircraftCondition:
        currentGame.aircraftCondition ||
        offer.condition,
      fleet: [
        ...currentGame.fleet,
        acquiredAircraft,
      ],
    },
  };
}

export function purchaseAircraft(
  currentGame: AirlineState,
  model: string,
) {
  return acquireAircraft(
    currentGame,
    `new-${model}`,
    "cash",
  );
}
