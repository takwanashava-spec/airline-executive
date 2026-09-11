import type {
  Aircraft,
  Hub,
  RouteSeed,
  Strategy,
} from "@/lib/game-data";

export const CURRENT_SAVE_VERSION = 9;

export type GameSpeed = 0 | 1 | 60 | 360;

export type FleetAircraftStatus =
  | "parked"
  | "active"
  | "maintenance"
  | "delivery";

export type AircraftAcquisitionType =
  | "owned"
  | "leased"
  | "financed";

export type AircraftMarket =
  | "new"
  | "used"
  | "lessor";

export type InboxAction = {
  id: "accept" | "revise" | "withdraw";
  label: string;
  requiresAmount?: boolean;
};

export type InboxMessage = {
  id: string;
  threadId: string;
  category: "aircraft" | "used-aircraft" | "auction" | "finance" | "operations";
  senderName: string;
  senderCompany: string;
  subject: string;
  body: string;
  receivedAt: string;
  priority: "normal" | "important" | "urgent";
  status: "unread" | "read" | "resolved" | "expired";
  responseDeadline?: string;
  relatedBidId?: string;
  actions: InboxAction[];
};

export type AuctionBid = {
  id: string;
  listingId: string;
  amount: number;
  placedAt: string;
  decisionAt: string;
  status: "pending" | "accepted" | "countered" | "rejected" | "withdrawn" | "completed";
  counterAmount?: number;
};

export type LeaseApplication = {
  id: string;
  offerId: string;
  submittedAt: string;
  decisionAt: string;
  status: "pending" | "approved" | "countered" | "rejected" | "withdrawn" | "completed";
  proposedMonthlyRate: number;
  approvedMonthlyRate?: number;
  depositMonths?: number;
};

export type UsedAircraftTransaction = {
  id: string;
  listingId: string;
  kind: "inspection" | "offer" | "finance" | "purchase";
  status: "pending" | "reported" | "accepted" | "countered" | "rejected" | "delivery" | "completed" | "withdrawn";
  submittedAt: string;
  decisionAt: string;
  amount: number;
  counterAmount?: number;
  inspectionType?: "records" | "physical";
  deliveryAt?: string;
};

export type FleetAircraft = {
  id: string;
  registration: string;
  aircraft: Aircraft;
  acquiredAt: string;
  purchasePrice: number;
  condition: number;
  status: FleetAircraftStatus;
  acquisitionType: AircraftAcquisitionType;
  market: AircraftMarket;
  provider: string;
  monthlyPayment: number;
  outstandingBalance: number;
  manufactureYear: number;
  flightHours: number;
};

export type View =
  | "overview"
  | "network"
  | "fleet"
  | "finance"
  | "inbox";

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
  fleet: FleetAircraft[];
  inbox: InboxMessage[];
  auctionBids: AuctionBid[];
  leaseApplications: LeaseApplication[];
  usedAircraftTransactions: UsedAircraftTransaction[];
  inspectedUsedAircraft: string[];
  usedAircraftWatchlist: string[];
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
