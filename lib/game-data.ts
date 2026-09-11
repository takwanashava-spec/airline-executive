export type Hub = {
  code: string;
  icao?: string;
  city: string;
  name: string;
  country: string;
  countryCode?: string;
  currency: string;
  market: string;
  runway: string;
  slotPressure: "Low" | "Medium" | "High";
  latitude?: number;
  longitude?: number;
  elevationFt?: number;
  airportType?: string;
  runwayCount?: number;
  terminalCount?: number;
  slotCapacityPerHour?: number;
  availableSlotsPercent?: number;
  passengerDemand?: number;
  cargoDemand?: number;
  annualPassengers?: number;
  annualCargoTonnes?: number;
  scheduledService?: boolean;
  infrastructureSource?: "Reference data" | "Modelled estimate";
  trafficSource?: "Published figure" | "Simulation estimate";
  coordinates: { x: number; y: number };
};

export type AircraftManufacturerId =
  | "atr"
  | "embraer"
  | "airbus"
  | "boeing";

export type AircraftManufacturer = {
  id: AircraftManufacturerId;
  name: string;
  fullName: string;
  division: string;
  headquarters: string;
  country: string;
};

export type AircraftAvailability =
  | "in-production"
  | "development";

export type Aircraft = {
  model: string;
  manufacturerId: AircraftManufacturerId;
  family: string;
  engine: string;
  availability: AircraftAvailability;
  seats: number;
  range: number;
  cruiseSpeed: number;
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
  { code: "JNB", icao: "FAOR", city: "Johannesburg", name: "O.R. Tambo International", country: "South Africa", countryCode: "ZA", currency: "ZAR", market: "Southern Africa", runway: "4,418 m", slotPressure: "Medium", latitude: -26.1392, longitude: 28.246, elevationFt: 5_558, airportType: "Large international", runwayCount: 2, terminalCount: 2, slotCapacityPerHour: 58, availableSlotsPercent: 31, passengerDemand: 82, cargoDemand: 78, annualPassengers: 22_400_000, annualCargoTonnes: 418_000, scheduledService: true, infrastructureSource: "Reference data", trafficSource: "Simulation estimate", coordinates: { x: 58, y: 72 } },
  { code: "LHR", icao: "EGLL", city: "London", name: "Heathrow", country: "United Kingdom", countryCode: "GB", currency: "GBP", market: "Europe", runway: "3,902 m", slotPressure: "High", latitude: 51.47, longitude: -0.4543, elevationFt: 83, airportType: "Large international", runwayCount: 2, terminalCount: 4, slotCapacityPerHour: 88, availableSlotsPercent: 7, passengerDemand: 97, cargoDemand: 90, annualPassengers: 83_900_000, annualCargoTonnes: 1_530_000, scheduledService: true, infrastructureSource: "Reference data", trafficSource: "Simulation estimate", coordinates: { x: 49, y: 31 } },
  { code: "DXB", icao: "OMDB", city: "Dubai", name: "Dubai International", country: "United Arab Emirates", countryCode: "AE", currency: "AED", market: "Middle East", runway: "4,447 m", slotPressure: "High", latitude: 25.2532, longitude: 55.3657, elevationFt: 62, airportType: "Large international", runwayCount: 2, terminalCount: 3, slotCapacityPerHour: 92, availableSlotsPercent: 11, passengerDemand: 96, cargoDemand: 94, annualPassengers: 91_800_000, annualCargoTonnes: 2_180_000, scheduledService: true, infrastructureSource: "Reference data", trafficSource: "Simulation estimate", coordinates: { x: 61, y: 44 } },
  { code: "SIN", icao: "WSSS", city: "Singapore", name: "Changi", country: "Singapore", countryCode: "SG", currency: "SGD", market: "Southeast Asia", runway: "4,000 m", slotPressure: "Medium", latitude: 1.3502, longitude: 103.994, elevationFt: 22, airportType: "Large international", runwayCount: 3, terminalCount: 4, slotCapacityPerHour: 84, availableSlotsPercent: 24, passengerDemand: 94, cargoDemand: 92, annualPassengers: 68_300_000, annualCargoTonnes: 1_970_000, scheduledService: true, infrastructureSource: "Reference data", trafficSource: "Simulation estimate", coordinates: { x: 79, y: 58 } },
  { code: "ATL", icao: "KATL", city: "Atlanta", name: "Hartsfield–Jackson", country: "United States", countryCode: "US", currency: "USD", market: "North America", runway: "3,776 m", slotPressure: "High", latitude: 33.6367, longitude: -84.4281, elevationFt: 1_026, airportType: "Large international", runwayCount: 5, terminalCount: 2, slotCapacityPerHour: 126, availableSlotsPercent: 14, passengerDemand: 98, cargoDemand: 85, annualPassengers: 104_600_000, annualCargoTonnes: 730_000, scheduledService: true, infrastructureSource: "Reference data", trafficSource: "Simulation estimate", coordinates: { x: 24, y: 42 } },
];

export const aircraftManufacturers: AircraftManufacturer[] = [
  {
    id: "atr",
    name: "ATR",
    fullName: "Avions de Transport Régional GIE",
    division: "Regional Aircraft",
    headquarters: "Blagnac, France",
    country: "France / Italy",
  },
  {
    id: "embraer",
    name: "Embraer",
    fullName: "Embraer S.A.",
    division: "Commercial Aviation",
    headquarters: "São José dos Campos, Brazil",
    country: "Brazil",
  },
  {
    id: "airbus",
    name: "Airbus",
    fullName: "Airbus S.A.S.",
    division: "Commercial Aircraft",
    headquarters: "Toulouse, France",
    country: "Europe",
  },
  {
    id: "boeing",
    name: "Boeing",
    fullName: "The Boeing Company",
    division: "Boeing Commercial Airplanes",
    headquarters: "United States",
    country: "United States",
  },
];

export const aircraft: Aircraft[] = [
  {
    model: "ATR 42-600",
    manufacturerId: "atr",
    family: "ATR -600 Series",
    engine: "2× Pratt & Whitney Canada PW127XT-M",
    availability: "in-production",
    seats: 48,
    range: 1_326,
    cruiseSpeed: 556,
    monthlyLease: 2_250_000,
    fuelBurn: 1.8,
    reliability: 98.7,
    turnaround: 25,
  },
  {
    model: "ATR 72-600",
    manufacturerId: "atr",
    family: "ATR -600 Series",
    engine: "2× Pratt & Whitney Canada PW127XT-M",
    availability: "in-production",
    seats: 72,
    range: 1_528,
    cruiseSpeed: 510,
    monthlyLease: 2_650_000,
    fuelBurn: 2.2,
    reliability: 98.7,
    turnaround: 28,
  },
  {
    model: "Embraer E175",
    manufacturerId: "embraer",
    family: "E-Jets",
    engine: "2× GE CF34-8E",
    availability: "in-production",
    seats: 76,
    range: 3_704,
    cruiseSpeed: 829,
    monthlyLease: 4_600_000,
    fuelBurn: 3.8,
    reliability: 98.4,
    turnaround: 30,
  },
  {
    model: "Embraer E190-E2",
    manufacturerId: "embraer",
    family: "E-Jets E2",
    engine: "2× Pratt & Whitney PW1900G",
    availability: "in-production",
    seats: 106,
    range: 5_278,
    cruiseSpeed: 870,
    monthlyLease: 5_350_000,
    fuelBurn: 4.5,
    reliability: 98.2,
    turnaround: 34,
  },
  {
    model: "Embraer E195-E2",
    manufacturerId: "embraer",
    family: "E-Jets E2",
    engine: "2× Pratt & Whitney PW1900G",
    availability: "in-production",
    seats: 132,
    range: 4_815,
    cruiseSpeed: 870,
    monthlyLease: 5_950_000,
    fuelBurn: 4.9,
    reliability: 98.1,
    turnaround: 36,
  },
  {
    model: "Airbus A220-100",
    manufacturerId: "airbus",
    family: "A220 Family",
    engine: "2× Pratt & Whitney PW1500G",
    availability: "in-production",
    seats: 120,
    range: 6_390,
    cruiseSpeed: 871,
    monthlyLease: 6_600_000,
    fuelBurn: 4.8,
    reliability: 97.9,
    turnaround: 37,
  },
  {
    model: "Airbus A220-300",
    manufacturerId: "airbus",
    family: "A220 Family",
    engine: "2× Pratt & Whitney PW1500G",
    availability: "in-production",
    seats: 145,
    range: 6_700,
    cruiseSpeed: 871,
    monthlyLease: 7_200_000,
    fuelBurn: 5.2,
    reliability: 97.9,
    turnaround: 39,
  },
  {
    model: "Airbus A319neo",
    manufacturerId: "airbus",
    family: "A320neo Family",
    engine: "2× CFM LEAP-1A or Pratt & Whitney PW1100G",
    availability: "in-production",
    seats: 140,
    range: 6_950,
    cruiseSpeed: 828,
    monthlyLease: 7_900_000,
    fuelBurn: 5.6,
    reliability: 97.8,
    turnaround: 40,
  },
  {
    model: "Airbus A320neo",
    manufacturerId: "airbus",
    family: "A320neo Family",
    engine: "2× CFM LEAP-1A or Pratt & Whitney PW1100G",
    availability: "in-production",
    seats: 180,
    range: 6_300,
    cruiseSpeed: 828,
    monthlyLease: 8_700_000,
    fuelBurn: 6,
    reliability: 97.9,
    turnaround: 43,
  },
  {
    model: "Airbus A321neo",
    manufacturerId: "airbus",
    family: "A320neo Family",
    engine: "2× CFM LEAP-1A or Pratt & Whitney PW1100G",
    availability: "in-production",
    seats: 220,
    range: 7_400,
    cruiseSpeed: 828,
    monthlyLease: 9_900_000,
    fuelBurn: 6.6,
    reliability: 97.8,
    turnaround: 47,
  },
  {
    model: "Airbus A321XLR",
    manufacturerId: "airbus",
    family: "A320neo Family",
    engine: "2× CFM LEAP-1A or Pratt & Whitney PW1100G",
    availability: "in-production",
    seats: 206,
    range: 8_700,
    cruiseSpeed: 828,
    monthlyLease: 11_200_000,
    fuelBurn: 6.8,
    reliability: 97.6,
    turnaround: 48,
  },
  {
    model: "Airbus A330-800",
    manufacturerId: "airbus",
    family: "A330neo Family",
    engine: "2× Rolls-Royce Trent 7000",
    availability: "in-production",
    seats: 257,
    range: 15_094,
    cruiseSpeed: 871,
    monthlyLease: 15_800_000,
    fuelBurn: 11.8,
    reliability: 97.7,
    turnaround: 62,
  },
  {
    model: "Airbus A330-900",
    manufacturerId: "airbus",
    family: "A330neo Family",
    engine: "2× Rolls-Royce Trent 7000",
    availability: "in-production",
    seats: 287,
    range: 13_334,
    cruiseSpeed: 871,
    monthlyLease: 17_200_000,
    fuelBurn: 12.6,
    reliability: 97.8,
    turnaround: 66,
  },
  {
    model: "Airbus A350-900",
    manufacturerId: "airbus",
    family: "A350 Family",
    engine: "2× Rolls-Royce Trent XWB",
    availability: "in-production",
    seats: 325,
    range: 15_372,
    cruiseSpeed: 903,
    monthlyLease: 21_500_000,
    fuelBurn: 13.8,
    reliability: 98,
    turnaround: 72,
  },
  {
    model: "Airbus A350-1000",
    manufacturerId: "airbus",
    family: "A350 Family",
    engine: "2× Rolls-Royce Trent XWB-97",
    availability: "in-production",
    seats: 366,
    range: 16_112,
    cruiseSpeed: 903,
    monthlyLease: 24_000_000,
    fuelBurn: 15.2,
    reliability: 97.9,
    turnaround: 78,
  },
  {
    model: "Boeing 737-7",
    manufacturerId: "boeing",
    family: "737 MAX Family",
    engine: "2× CFM LEAP-1B",
    availability: "development",
    seats: 148,
    range: 7_040,
    cruiseSpeed: 839,
    monthlyLease: 7_900_000,
    fuelBurn: 5.5,
    reliability: 97.8,
    turnaround: 40,
  },
  {
    model: "Boeing 737-8",
    manufacturerId: "boeing",
    family: "737 MAX Family",
    engine: "2× CFM LEAP-1B",
    availability: "in-production",
    seats: 170,
    range: 6_480,
    cruiseSpeed: 839,
    monthlyLease: 8_900_000,
    fuelBurn: 6.1,
    reliability: 97.8,
    turnaround: 43,
  },
  {
    model: "Boeing 737-9",
    manufacturerId: "boeing",
    family: "737 MAX Family",
    engine: "2× CFM LEAP-1B",
    availability: "in-production",
    seats: 185,
    range: 6_110,
    cruiseSpeed: 839,
    monthlyLease: 9_700_000,
    fuelBurn: 6.4,
    reliability: 97.7,
    turnaround: 45,
  },
  {
    model: "Boeing 737-10",
    manufacturerId: "boeing",
    family: "737 MAX Family",
    engine: "2× CFM LEAP-1B",
    availability: "development",
    seats: 200,
    range: 5_740,
    cruiseSpeed: 839,
    monthlyLease: 10_400_000,
    fuelBurn: 6.8,
    reliability: 97.7,
    turnaround: 47,
  },
  {
    model: "Boeing 787-8",
    manufacturerId: "boeing",
    family: "787 Dreamliner Family",
    engine: "2× GE GEnx-1B or Rolls-Royce Trent 1000",
    availability: "in-production",
    seats: 248,
    range: 14_820,
    cruiseSpeed: 903,
    monthlyLease: 18_800_000,
    fuelBurn: 11.7,
    reliability: 97.8,
    turnaround: 64,
  },
  {
    model: "Boeing 787-9",
    manufacturerId: "boeing",
    family: "787 Dreamliner Family",
    engine: "2× GE GEnx-1B or Rolls-Royce Trent 1000",
    availability: "in-production",
    seats: 290,
    range: 15_370,
    cruiseSpeed: 903,
    monthlyLease: 21_000_000,
    fuelBurn: 13,
    reliability: 97.9,
    turnaround: 69,
  },
  {
    model: "Boeing 787-10",
    manufacturerId: "boeing",
    family: "787 Dreamliner Family",
    engine: "2× GE GEnx-1B or Rolls-Royce Trent 1000",
    availability: "in-production",
    seats: 336,
    range: 13_890,
    cruiseSpeed: 903,
    monthlyLease: 22_800_000,
    fuelBurn: 14.2,
    reliability: 97.8,
    turnaround: 74,
  },
  {
    model: "Boeing 777-8",
    manufacturerId: "boeing",
    family: "777X Family",
    engine: "2× GE Aerospace GE9X",
    availability: "development",
    seats: 395,
    range: 17_590,
    cruiseSpeed: 905,
    monthlyLease: 27_500_000,
    fuelBurn: 16.5,
    reliability: 97.6,
    turnaround: 82,
  },
  {
    model: "Boeing 777-9",
    manufacturerId: "boeing",
    family: "777X Family",
    engine: "2× GE Aerospace GE9X",
    availability: "development",
    seats: 420,
    range: 14_820,
    cruiseSpeed: 905,
    monthlyLease: 30_000_000,
    fuelBurn: 17.6,
    reliability: 97.6,
    turnaround: 88,
  },
];

export const aircraftPurchasePrices: Record<
  Aircraft["model"],
  number
> = {
  "ATR 42-600": 52_000_000,
  "ATR 72-600": 62_000_000,
  "Embraer E175": 96_000_000,
  "Embraer E190-E2": 108_000_000,
  "Embraer E195-E2": 118_000_000,
  "Airbus A220-100": 136_000_000,
  "Airbus A220-300": 146_000_000,
  "Airbus A319neo": 155_000_000,
  "Airbus A320neo": 172_000_000,
  "Airbus A321neo": 198_000_000,
  "Airbus A321XLR": 240_000_000,
  "Airbus A330-800": 340_000_000,
  "Airbus A330-900": 360_000_000,
  "Airbus A350-900": 480_000_000,
  "Airbus A350-1000": 540_000_000,
  "Boeing 737-7": 160_000_000,
  "Boeing 737-8": 180_000_000,
  "Boeing 737-9": 195_000_000,
  "Boeing 737-10": 212_000_000,
  "Boeing 787-8": 390_000_000,
  "Boeing 787-9": 430_000_000,
  "Boeing 787-10": 470_000_000,
  "Boeing 777-8": 590_000_000,
  "Boeing 777-9": 640_000_000,
};

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
