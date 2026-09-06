export type Hub = {
  code: string;
  city: string;
  name: string;
  country: string;
  currency: string;
  market: string;
  runway: string;
  slotPressure: "Low" | "Medium" | "High";
  coordinates: { x: number; y: number };
};

export type Aircraft = {
  model: string;
  family: string;
  seats: number;
  range: number;
  monthlyLease: number;
  fuelBurn: number;
  reliability: number;
  turnaround: number;
};

export type Strategy = {
  id: "regional" | "network" | "premium";
  name: string;
  description: string;
  capital: number;
  fareMultiplier: number;
  demandMultiplier: number;
};

export type RouteSeed = {
  from: string;
  to: string;
  city: string;
  distance: number;
  blockTime: string;
  baseFare: number;
  weeklyFlights: number;
  demand: number;
  coordinates: { x: number; y: number };
};

export const hubs: Hub[] = [
  { code: "JNB", city: "Johannesburg", name: "O.R. Tambo International", country: "South Africa", currency: "ZAR", market: "Southern Africa", runway: "4,418 m", slotPressure: "Medium", coordinates: { x: 58, y: 72 } },
  { code: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", currency: "GBP", market: "Europe", runway: "3,902 m", slotPressure: "High", coordinates: { x: 49, y: 31 } },
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "United Arab Emirates", currency: "AED", market: "Middle East", runway: "4,447 m", slotPressure: "High", coordinates: { x: 61, y: 44 } },
  { code: "SIN", city: "Singapore", name: "Changi", country: "Singapore", currency: "SGD", market: "Southeast Asia", runway: "4,000 m", slotPressure: "Medium", coordinates: { x: 79, y: 58 } },
  { code: "ATL", city: "Atlanta", name: "Hartsfield–Jackson", country: "United States", currency: "USD", market: "North America", runway: "3,776 m", slotPressure: "High", coordinates: { x: 24, y: 42 } },
];

export const aircraft: Aircraft[] = [
  { model: "ATR 72-600", family: "Turboprop", seats: 72, range: 1_528, monthlyLease: 2_650_000, fuelBurn: 2.2, reliability: 98.7, turnaround: 28 },
  { model: "Embraer E195-E2", family: "Regional jet", seats: 132, range: 4_815, monthlyLease: 5_950_000, fuelBurn: 4.9, reliability: 98.1, turnaround: 36 },
  { model: "Airbus A220-300", family: "Narrow-body", seats: 145, range: 6_297, monthlyLease: 7_200_000, fuelBurn: 5.2, reliability: 97.9, turnaround: 39 },
];

export const strategies: Strategy[] = [
  { id: "regional", name: "Regional specialist", description: "High-frequency links between underserved cities with a lean cost base.", capital: 85_000_000, fareMultiplier: 0.88, demandMultiplier: 1.08 },
  { id: "network", name: "Network carrier", description: "Build a connected hub with balanced business and leisure demand.", capital: 150_000_000, fareMultiplier: 1, demandMultiplier: 1 },
  { id: "premium", name: "Premium challenger", description: "Fewer routes, higher service standards and stronger yields.", capital: 210_000_000, fareMultiplier: 1.28, demandMultiplier: 0.86 },
];

export const routeSeeds: Record<string, RouteSeed[]> = {
  JNB: [
    { from: "JNB", to: "CPT", city: "Cape Town", distance: 1_271, blockTime: "2h 10m", baseFare: 1_520, weeklyFlights: 14, demand: 86, coordinates: { x: 48, y: 78 } },
    { from: "JNB", to: "DUR", city: "Durban", distance: 478, blockTime: "1h 05m", baseFare: 1_080, weeklyFlights: 18, demand: 78, coordinates: { x: 61, y: 78 } },
    { from: "JNB", to: "HRE", city: "Harare", distance: 959, blockTime: "1h 40m", baseFare: 1_740, weeklyFlights: 10, demand: 71, coordinates: { x: 60, y: 65 } },
  ],
  LHR: [
    { from: "LHR", to: "AMS", city: "Amsterdam", distance: 370, blockTime: "1h 15m", baseFare: 2_100, weeklyFlights: 18, demand: 89, coordinates: { x: 53, y: 29 } },
    { from: "LHR", to: "CDG", city: "Paris", distance: 344, blockTime: "1h 10m", baseFare: 2_250, weeklyFlights: 21, demand: 91, coordinates: { x: 52, y: 34 } },
    { from: "LHR", to: "EDI", city: "Edinburgh", distance: 534, blockTime: "1h 20m", baseFare: 1_850, weeklyFlights: 16, demand: 74, coordinates: { x: 47, y: 25 } },
  ],
  DXB: [
    { from: "DXB", to: "MCT", city: "Muscat", distance: 349, blockTime: "1h 05m", baseFare: 1_780, weeklyFlights: 16, demand: 76, coordinates: { x: 65, y: 47 } },
    { from: "DXB", to: "DOH", city: "Doha", distance: 379, blockTime: "1h 10m", baseFare: 1_920, weeklyFlights: 18, demand: 84, coordinates: { x: 59, y: 46 } },
    { from: "DXB", to: "RUH", city: "Riyadh", distance: 874, blockTime: "1h 55m", baseFare: 2_450, weeklyFlights: 12, demand: 81, coordinates: { x: 57, y: 43 } },
  ],
  SIN: [
    { from: "SIN", to: "KUL", city: "Kuala Lumpur", distance: 296, blockTime: "1h 00m", baseFare: 1_340, weeklyFlights: 21, demand: 92, coordinates: { x: 77, y: 54 } },
    { from: "SIN", to: "CGK", city: "Jakarta", distance: 879, blockTime: "1h 50m", baseFare: 1_680, weeklyFlights: 16, demand: 85, coordinates: { x: 79, y: 65 } },
    { from: "SIN", to: "BKK", city: "Bangkok", distance: 1_430, blockTime: "2h 25m", baseFare: 2_180, weeklyFlights: 12, demand: 83, coordinates: { x: 75, y: 47 } },
  ],
  ATL: [
    { from: "ATL", to: "MCO", city: "Orlando", distance: 650, blockTime: "1h 35m", baseFare: 1_940, weeklyFlights: 18, demand: 88, coordinates: { x: 27, y: 49 } },
    { from: "ATL", to: "DCA", city: "Washington", distance: 880, blockTime: "1h 45m", baseFare: 2_280, weeklyFlights: 16, demand: 82, coordinates: { x: 29, y: 37 } },
    { from: "ATL", to: "MIA", city: "Miami", distance: 957, blockTime: "1h 55m", baseFare: 2_420, weeklyFlights: 14, demand: 87, coordinates: { x: 26, y: 53 } },
  ],
};

export const formatMoney = (value: number) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000_000) return `${sign}R${(abs / 1_000_000_000).toFixed(2)}bn`;
  if (abs >= 1_000_000) return `${sign}R${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}R${(abs / 1_000).toFixed(0)}k`;
  return `${sign}R${abs.toFixed(0)}`;
};
