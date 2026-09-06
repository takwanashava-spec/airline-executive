import type { Airport } from "airport-data-js";

import {
  hubs,
  type Hub,
  type RouteSeed,
} from "@/lib/game-data";

type AirportLibrary =
  typeof import("airport-data-js");

const loadAirportLibrary =
  async (): Promise<AirportLibrary> => {
    const airportModule = (await import(
      "airport-data-js"
    )) as AirportLibrary & {
      default?: AirportLibrary;
    };

    return airportModule.default ?? airportModule;
  };

const CONTINENT_MARKETS: Record<string, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia Pacific",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  ZA: "ZAR",
  ZW: "USD",
  GB: "GBP",
  US: "USD",
  AE: "AED",
  SG: "SGD",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  BR: "BRL",
  CH: "CHF",
  EU: "EUR",
};

const CITY_OVERRIDES: Record<string, string> = {
  JNB: "Johannesburg",
  CPT: "Cape Town",
  DUR: "Durban",
  HRE: "Harare",
  LHR: "London",
  LGW: "London",
  CDG: "Paris",
  AMS: "Amsterdam",
  DXB: "Dubai",
  DOH: "Doha",
  SIN: "Singapore",
  ATL: "Atlanta",
  JFK: "New York",
  LAX: "Los Angeles",
  ORD: "Chicago",
  GRU: "São Paulo",
  NBO: "Nairobi",
  ADD: "Addis Ababa",
  CAI: "Cairo",
  LOS: "Lagos",
  SYD: "Sydney",
  MEL: "Melbourne",
  HND: "Tokyo",
  NRT: "Tokyo",
};

const VERIFIED_COUNTS: Record<
  string,
  {
    runways: number;
    terminals: number;
  }
> = {
  JNB: {
    runways: 2,
    terminals: 2,
  },
  LHR: {
    runways: 2,
    terminals: 4,
  },
  DXB: {
    runways: 2,
    terminals: 3,
  },
  SIN: {
    runways: 3,
    terminals: 4,
  },
  ATL: {
    runways: 5,
    terminals: 2,
  },
  CPT: {
    runways: 2,
    terminals: 1,
  },
  DUR: {
    runways: 1,
    terminals: 1,
  },
  HRE: {
    runways: 1,
    terminals: 2,
  },
  JFK: {
    runways: 4,
    terminals: 5,
  },
  CDG: {
    runways: 4,
    terminals: 3,
  },
};

const AIRPORT_FACT_OVERRIDES: Record<
  string,
  Partial<Hub>
> = {
  HRE: {
    icao: "FVRG",
    city: "Harare",
    latitude: -17.931801,
    longitude: 31.0928,
    elevationFt: 4_887,
    runway: "4,725 m",
    runwayCount: 1,
    terminalCount: 2,
    slotCapacityPerHour: 18,
    availableSlotsPercent: 58,
    slotPressure: "Low",
    passengerDemand: 64,
    cargoDemand: 57,
    annualPassengers: 1_350_000,
    annualCargoTonnes: 16_000,
    infrastructureSource: "Reference data",
    trafficSource: "Simulation estimate",
  },
};

function deterministicSeed(code: string) {
  return [...code].reduce(
    (sum, letter, index) =>
      sum +
      letter.charCodeAt(0) * (index + 3),
    17,
  );
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function hasScheduledService(airport: Airport) {
  const value = String(
    airport.scheduled_service,
  ).toLowerCase();

  return (
    airport.scheduled_service === true ||
    value === "yes" ||
    value === "true"
  );
}

function countryName(countryCode: string) {
  try {
    return (
      new Intl.DisplayNames(["en"], {
        type: "region",
      }).of(countryCode) ?? countryCode
    );
  } catch {
    return countryCode;
  }
}

function airportClass(type: string) {
  if (type === "large_airport") {
    return "Large international";
  }

  if (type === "medium_airport") {
    return "Regional / medium";
  }

  if (type === "small_airport") {
    return "Local / small";
  }

  if (type === "seaplane_base") {
    return "Seaplane base";
  }

  return "Special-use airport";
}

function cityFromAirport(airport: Airport) {
  if (CITY_OVERRIDES[airport.iata]) {
    return CITY_OVERRIDES[airport.iata];
  }

  return airport.airport
    .replace(/\bInternational\b/gi, "")
    .replace(/\bRegional\b/gi, "")
    .replace(/\bMunicipal\b/gi, "")
    .replace(/\bAirport\b/gi, "")
    .replace(/\bAerodrome\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function coordinates(
  latitude: number,
  longitude: number,
) {
  return {
    x: clamp(
      ((longitude + 180) / 360) * 100,
      4,
      96,
    ),
    y: clamp(
      ((90 - latitude) / 180) * 100,
      7,
      93,
    ),
  };
}

export function airportToHub(
  airport: Airport,
): Hub {
  const seed = deterministicSeed(
    airport.iata || airport.icao,
  );

  const sizeBase =
    airport.type === "large_airport"
      ? 82
      : airport.type === "medium_airport"
        ? 57
        : 31;

  const runwayLengthFt =
    Number(airport.runway_length) ||
    (airport.type === "large_airport"
      ? 10_500
      : airport.type === "medium_airport"
        ? 7_200
        : 4_200);

  const knownCounts =
    VERIFIED_COUNTS[airport.iata];

  const runwayCount =
    knownCounts?.runways ??
    (airport.type === "large_airport"
      ? 2 + (seed % 3)
      : airport.type === "medium_airport"
        ? 1 + (seed % 2)
        : 1);

  const terminalCount =
    knownCounts?.terminals ??
    (airport.type === "large_airport"
      ? 2 + (seed % 3)
      : 1);

  const passengerDemand = clamp(
    sizeBase +
      (seed % 17) -
      8 +
      (hasScheduledService(airport) ? 5 : -10),
    12,
    98,
  );

  const cargoDemand = clamp(
    sizeBase -
      7 +
      ((seed * 7) % 23) -
      10,
    8,
    96,
  );

  const slotCapacityPerHour = Math.round(
    runwayCount *
      (airport.type === "large_airport"
        ? 31
        : airport.type === "medium_airport"
          ? 20
          : 9),
  );

  const availableSlotsPercent = clamp(
    78 - passengerDemand + (seed % 16),
    5,
    72,
  );

  const scale =
    airport.type === "large_airport"
      ? 1_000_000
      : airport.type === "medium_airport"
        ? 125_000
        : 8_000;

  const annualPassengers = Math.round(
    (passengerDemand ** 2 * scale) / 112,
  );

  const annualCargoTonnes = Math.round(
    (cargoDemand ** 2 *
      (airport.type === "large_airport"
        ? 260
        : airport.type === "medium_airport"
          ? 24
          : 1.8)) /
      10,
  );

  const latitude =
    Number(airport.latitude) || 0;

  const longitude =
    Number(airport.longitude) || 0;

  const baseHub: Hub = {
    code: airport.iata || airport.icao,
    icao: airport.icao || undefined,
    city: cityFromAirport(airport),
    name: airport.airport,
    country: countryName(
      airport.country_code,
    ),
    countryCode: airport.country_code,
    currency:
      CURRENCY_BY_COUNTRY[
        airport.country_code
      ] ?? "USD",
    market:
      CONTINENT_MARKETS[
        airport.continent
      ] ?? "Global market",
    runway: `${Math.round(
      runwayLengthFt * 0.3048,
    ).toLocaleString()} m`,
    slotPressure:
      availableSlotsPercent < 18
        ? "High"
        : availableSlotsPercent < 38
          ? "Medium"
          : "Low",
    latitude,
    longitude,
    elevationFt:
      Number(
        airport.elevation_ft ||
          airport.elevation,
      ) || 0,
    airportType: airportClass(airport.type),
    runwayCount,
    terminalCount,
    slotCapacityPerHour,
    availableSlotsPercent,
    passengerDemand,
    cargoDemand,
    annualPassengers,
    annualCargoTonnes,
    scheduledService:
      hasScheduledService(airport),
    infrastructureSource:
      knownCounts || airport.runway_length
        ? "Reference data"
        : "Modelled estimate",
    trafficSource: "Simulation estimate",
    coordinates: coordinates(
      latitude,
      longitude,
    ),
  };

  const override =
    AIRPORT_FACT_OVERRIDES[airport.iata];

  if (!override) {
    return baseHub;
  }

  const correctedLatitude =
    override.latitude ?? latitude;

  const correctedLongitude =
    override.longitude ?? longitude;

  return {
    ...baseHub,
    ...override,
    coordinates: coordinates(
      correctedLatitude,
      correctedLongitude,
    ),
  };
}

export async function searchAirports(
  query: string,
): Promise<Hub[]> {
  const cleaned = query.trim();

  if (cleaned.length < 2) {
    return hubs;
  }

  const upper = cleaned.toUpperCase();

  const featuredMatches = hubs.filter(
    (hub) =>
      `${hub.code} ${hub.icao ?? ""} ${
        hub.city
      } ${hub.name} ${hub.country}`
        .toLowerCase()
        .includes(cleaned.toLowerCase()),
  );

  const {
    getAirportByIata,
    getAirportByIcao,
    getAutocompleteSuggestions,
  } = await loadAirportLibrary();

  const resultSets: Airport[][] = [];

  const attempts: Promise<Airport[]>[] = [
    getAutocompleteSuggestions(
      cleaned,
    ).catch(() => []),
  ];

  if (/^[A-Z]{3}$/.test(upper)) {
    attempts.push(
      getAirportByIata(upper).catch(() => []),
    );
  }

  if (/^[A-Z]{4}$/.test(upper)) {
    attempts.push(
      getAirportByIcao(upper).catch(() => []),
    );
  }

  resultSets.push(
    ...(await Promise.all(attempts)),
  );

  const uniqueHubs = new Map(
    featuredMatches.map((hub) => [
      `${hub.code}-${hub.icao}`,
      hub,
    ]),
  );

  const unique = new Map<string, Airport>();

  resultSets.flat().forEach((airport) => {
    if (
      airport.iata &&
      airport.type !== "closed"
    ) {
      unique.set(
        `${airport.iata}-${airport.icao}`,
        airport,
      );
    }
  });

  [...unique.values()]
    .sort(
      (firstAirport, secondAirport) =>
        Number(
          hasScheduledService(secondAirport),
        ) -
        Number(
          hasScheduledService(firstAirport),
        ),
    )
    .map(airportToHub)
    .forEach((hub) => {
      const key = `${hub.code}-${hub.icao}`;

      if (!uniqueHubs.has(key)) {
        uniqueHubs.set(key, hub);
      }
    });

  return [...uniqueHubs.values()].slice(0, 10);
}

function distanceKm(
  from: Hub,
  to: Hub,
) {
  const lat1 =
    ((from.latitude ?? 0) * Math.PI) / 180;

  const lat2 =
    ((to.latitude ?? 0) * Math.PI) / 180;

  const deltaLat = lat2 - lat1;

  const deltaLon =
    (((to.longitude ?? 0) -
      (from.longitude ?? 0)) *
      Math.PI) /
    180;

  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  return Math.round(
    6_371 *
      2 *
      Math.atan2(
        Math.sqrt(value),
        Math.sqrt(1 - value),
      ),
  );
}

export function calculateBlockTime(
  distance: number,
  cruiseSpeedKmh: number,
  slotPressure: Hub["slotPressure"],
) {
  const cruiseMinutes =
    (distance / cruiseSpeedKmh) * 60;

  const climbAndDescentMinutes =
    distance < 500
      ? 20
      : distance < 1_500
        ? 24
        : 28;

  const taxiMinutes =
    slotPressure === "High"
      ? 35
      : slotPressure === "Medium"
        ? 25
        : 18;

  const totalMinutes =
    cruiseMinutes +
    climbAndDescentMinutes +
    taxiMinutes;

  const roundedMinutes =
    Math.round(totalMinutes / 5) * 5;

  return `${Math.floor(
    roundedMinutes / 60,
  )}h ${String(
    roundedMinutes % 60,
  ).padStart(2, "0")}m`;
}

function toRoute(
  from: Hub,
  airport: Airport,
): RouteSeed {
  const destination =
    airportToHub(airport);

  const distance = Math.max(
    80,
    distanceKm(from, destination),
  );

  const demand = Math.round(
    ((destination.passengerDemand ?? 50) +
      (from.passengerDemand ?? 50)) /
      2,
  );

  return {
    from: from.code,
    to: destination.code,
    city: destination.city,
    distance,
    blockTime: calculateBlockTime(
      distance,
      790,
      from.slotPressure,
    ),
    baseFare:
      Math.round(
        (720 +
          distance * 1.38 +
          demand * 4) /
          10,
      ) * 10,
    weeklyFlights:
      demand >= 82
        ? 14
        : demand >= 68
          ? 10
          : 7,
    demand,
    coordinates: destination.coordinates,
  };
}

export async function buildStarterRoutes(
  hub: Hub,
): Promise<RouteSeed[]> {
  if (
    hub.latitude == null ||
    hub.longitude == null
  ) {
    return [];
  }

  const {
    findNearbyAirports,
  } = await loadAirportLibrary();

  let nearby = await findNearbyAirports(
    hub.latitude,
    hub.longitude,
    3_500,
  ).catch(() => []);

  nearby = nearby.filter(
    (airport) =>
      airport.iata &&
      airport.iata !== hub.code &&
      airport.type !== "closed" &&
      hasScheduledService(airport),
  );

  if (nearby.length < 3) {
    nearby = await findNearbyAirports(
      hub.latitude,
      hub.longitude,
      9_000,
    ).catch(() => nearby);

    nearby = nearby.filter(
      (airport) =>
        airport.iata &&
        airport.iata !== hub.code &&
        airport.type !== "closed" &&
        hasScheduledService(airport),
    );
  }

  const strategicGateways = new Set([
    "JNB",
    "CPT",
    "DUR",
    "LUN",
    "NBO",
    "ADD",
    "GBE",
    "MPM",
    "WDH",
    "DAR",
    "LOS",
    "ACC",
    "CAI",
    "CMN",
    "KGL",
    "LAD",
  ]);

  const ranked = nearby
    .map((airport) => {
      const destination =
        airportToHub(airport);

      const distance = distanceKm(
        hub,
        destination,
      );

      const airportSizeScore =
        airport.type === "large_airport"
          ? 52
          : airport.type ===
              "medium_airport"
            ? 24
            : 4;

      const distanceScore =
        distance >= 250 &&
        distance <= 1_400
          ? 24
          : distance <= 2_400
            ? 17
            : distance <= 3_500
              ? 8
              : -20;

      const gatewayBonus =
        strategicGateways.has(airport.iata)
          ? 18
          : 0;

      const demandScore =
        (destination.passengerDemand ??
          50) * 0.72;

      return {
        airport,
        distance,
        score:
          airportSizeScore +
          distanceScore +
          gatewayBonus +
          demandScore,
      };
    })
    .filter(
      (candidate) =>
        candidate.distance >= 180,
    )
    .sort(
      (firstCandidate, secondCandidate) =>
        secondCandidate.score -
        firstCandidate.score,
    );

  const selected: Airport[] = [];

  const selectBestInRange = (
    minimumDistance: number,
    maximumDistance: number,
  ) => {
    const candidate = ranked.find(
      (item) =>
        item.distance >= minimumDistance &&
        item.distance <= maximumDistance &&
        !selected.some(
          (airport) =>
            airport.iata ===
            item.airport.iata,
        ),
    );

    if (candidate) {
      selected.push(candidate.airport);
    }
  };

  selectBestInRange(180, 700);
  selectBestInRange(700, 1_400);
  selectBestInRange(1_400, 2_600);

  for (const candidate of ranked) {
    if (selected.length >= 3) {
      break;
    }

    if (
      !selected.some(
        (airport) =>
          airport.iata ===
          candidate.airport.iata,
      )
    ) {
      selected.push(candidate.airport);
    }
  }

  return selected.map((airport) =>
    toRoute(hub, airport),
  );
}

export function formatAnnualTraffic(
  value = 0,
  suffix = "",
) {
  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(
      value >= 10_000_000 ? 1 : 2,
    )}m${suffix}`;
  }

  if (value >= 1_000) {
    return `${Math.round(
      value / 1_000,
    )}k${suffix}`;
  }

  return `${value.toLocaleString()}${suffix}`;
}