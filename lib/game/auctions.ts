import { aircraft, type Aircraft } from "@/lib/game-data";
import type { AirlineState, AuctionBid, FleetAircraft, InboxMessage } from "@/types/game";

const DAY_MS = 24 * 60 * 60 * 1_000;

export type AuctionListing = {
  id: string;
  aircraft: Aircraft;
  manufacturer: Aircraft["manufacturerId"];
  seller: string;
  location: string;
  registration: string;
  serialNumber: string;
  manufactureYear: number;
  flightHours: number;
  flightCycles: number;
  condition: number;
  currentBid: number;
  reservePrice: number;
  closesAt: string;
};

function model(name: string) {
  const result = aircraft.find((item) => item.model === name);
  if (!result) throw new Error(`Missing auction aircraft model: ${name}`);
  return result;
}

export const auctionListings: AuctionListing[] = [
  {
    id: "auction-atr72-2016",
    aircraft: model("ATR 72-600"),
    manufacturer: "atr",
    seller: "Southern Cross Aviation Auctions",
    location: "Johannesburg, South Africa",
    registration: "ZS-MRE",
    serialNumber: "MSN 1328",
    manufactureYear: 2016,
    flightHours: 22_840,
    flightCycles: 19_210,
    condition: 78,
    currentBid: 25_500_000,
    reservePrice: 28_000_000,
    closesAt: "2026-09-20T16:00:00.000Z",
  },
  {
    id: "auction-e195-2019",
    aircraft: model("Embraer E195-E2"),
    manufacturer: "embraer",
    seller: "AeroAsset Recovery Partners",
    location: "Lisbon, Portugal",
    registration: "CS-TYX",
    serialNumber: "MSN 19020034",
    manufactureYear: 2019,
    flightHours: 15_460,
    flightCycles: 9_880,
    condition: 84,
    currentBid: 55_000_000,
    reservePrice: 60_000_000,
    closesAt: "2026-09-24T14:00:00.000Z",
  },
  {
    id: "auction-a220-2020",
    aircraft: model("Airbus A220-300"),
    manufacturer: "airbus",
    seller: "Meridian Aircraft Remarketing",
    location: "Toulouse, France",
    registration: "YL-AAX",
    serialNumber: "MSN 55108",
    manufactureYear: 2020,
    flightHours: 12_120,
    flightCycles: 7_440,
    condition: 87,
    currentBid: 76_000_000,
    reservePrice: 82_000_000,
    closesAt: "2026-09-28T12:00:00.000Z",
  },
];

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function message(input: Omit<InboxMessage, "id" | "receivedAt" | "status">, gameTime: string): InboxMessage {
  return { ...input, id: id("mail"), receivedAt: gameTime, status: "unread" };
}

export function submitAuctionBid(game: AirlineState, listingId: string, amount: number) {
  const listing = auctionListings.find((item) => item.id === listingId);
  if (!listing) return { game, error: "This auction listing is no longer available." };
  if (!Number.isFinite(amount) || amount <= listing.currentBid) {
    return { game, error: "Your bid must exceed the current bid." };
  }
  if (amount > game.cash) return { game, error: "The airline cannot fund this bid." };

  const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
  const bid: AuctionBid = {
    id: id("bid"), listingId, amount: Math.round(amount), placedAt: game.gameDateTime,
    decisionAt, status: "pending",
  };
  const confirmation = message({
    threadId: bid.id,
    category: "auction",
    senderName: "Amelia Grant",
    senderCompany: listing.seller,
    subject: `Bid received: ${listing.aircraft.model} ${listing.serialNumber}`,
    body: `Dear ${game.ceoName},\n\nWe acknowledge receipt of ${game.airlineName}'s bid of ${Math.round(amount).toLocaleString("en-ZA")} for ${listing.registration}. The seller will consider the proposal and issue a formal decision within one game day.\n\nKind regards,\nAmelia Grant\nAircraft Transactions Director`,
    priority: "important",
    responseDeadline: decisionAt,
    relatedBidId: bid.id,
    actions: [],
  }, game.gameDateTime);

  return {
    error: null,
    game: { ...game, auctionBids: [...game.auctionBids, bid], inbox: [confirmation, ...game.inbox] },
  };
}

export function processAuctionDecisions(game: AirlineState, targetTime: string) {
  const now = Date.parse(targetTime);
  let inbox = game.inbox;
  const bids = game.auctionBids.map((bid) => {
    if (bid.status !== "pending" || Date.parse(bid.decisionAt) > now) return bid;
    const listing = auctionListings.find((item) => item.id === bid.listingId);
    if (!listing) return { ...bid, status: "rejected" as const };

    const accepted = bid.amount >= listing.reservePrice;
    const countered = !accepted && bid.amount >= listing.reservePrice * 0.9;
    const counterAmount = countered ? listing.reservePrice : undefined;
    const status = accepted ? "accepted" as const : countered ? "countered" as const : "rejected" as const;
    const subject = accepted
      ? `Bid accepted: ${listing.aircraft.model} ${listing.serialNumber}`
      : countered
        ? `Counteroffer: ${listing.aircraft.model} ${listing.serialNumber}`
        : `Bid decision: ${listing.aircraft.model} ${listing.serialNumber}`;
    const outcome = accepted
      ? `The seller has accepted your bid of ${bid.amount.toLocaleString("en-ZA")}. Please confirm completion of the purchase within two game days.`
      : countered
        ? `The seller cannot accept your bid of ${bid.amount.toLocaleString("en-ZA")}, but is prepared to conclude the sale for ${listing.reservePrice.toLocaleString("en-ZA")}.`
        : `The seller has declined your bid of ${bid.amount.toLocaleString("en-ZA")}. You may submit a revised bid if the listing remains open.`;
    const decision = message({
      threadId: bid.id,
      category: "auction",
      senderName: "Amelia Grant",
      senderCompany: listing.seller,
      subject,
      body: `Dear ${game.ceoName},\n\n${outcome}\n\nKind regards,\nAmelia Grant\nAircraft Transactions Director`,
      priority: accepted || countered ? "urgent" : "normal",
      responseDeadline: new Date(now + 2 * DAY_MS).toISOString(),
      relatedBidId: bid.id,
      actions: accepted
        ? [{ id: "accept", label: "Complete purchase" }, { id: "withdraw", label: "Withdraw" }]
        : countered
          ? [{ id: "accept", label: "Accept counteroffer" }, { id: "revise", label: "Submit revised bid", requiresAmount: true }, { id: "withdraw", label: "Withdraw" }]
          : [{ id: "revise", label: "Submit revised bid", requiresAmount: true }, { id: "withdraw", label: "Close correspondence" }],
    }, targetTime);
    inbox = [decision, ...inbox];
    return { ...bid, status, counterAmount };
  });
  return { ...game, auctionBids: bids, inbox };
}

function registration(game: AirlineState) {
  const prefixes: Record<string, string> = { ZA: "ZS", ZW: "Z", GB: "G", US: "N", AU: "VH", AE: "A6" };
  return `${prefixes[game.hub.countryCode ?? ""] ?? game.icao.slice(0, 2)}-${String(game.fleet.length + 1).padStart(3, "0")}`;
}

export function respondToAuctionMessage(game: AirlineState, messageId: string, action: "accept" | "revise" | "withdraw", revisedAmount?: number) {
  const mail = game.inbox.find((item) => item.id === messageId);
  const bid = game.auctionBids.find((item) => item.id === mail?.relatedBidId);
  const listing = auctionListings.find((item) => item.id === bid?.listingId);
  if (!mail || !bid || !listing) return { game, error: "This correspondence is no longer actionable." };

  if (action === "revise") {
    const nextAmount = Math.round(revisedAmount ?? 0);
    if (nextAmount <= bid.amount || nextAmount > game.cash) return { game, error: "Enter a higher bid that the airline can fund." };
    const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
    return {
      error: null,
      game: {
        ...game,
        auctionBids: game.auctionBids.map((item) => item.id === bid.id ? { ...item, amount: nextAmount, status: "pending", placedAt: game.gameDateTime, decisionAt, counterAmount: undefined } : item),
        inbox: game.inbox.map((item) => item.id === mail.id ? { ...item, status: "resolved", actions: [] } : item),
      },
    };
  }

  if (action === "withdraw") {
    return { error: null, game: { ...game, auctionBids: game.auctionBids.map((item) => item.id === bid.id ? { ...item, status: "withdrawn" } : item), inbox: game.inbox.map((item) => item.id === mail.id ? { ...item, status: "resolved", actions: [] } : item) } };
  }

  const price = bid.status === "countered" ? bid.counterAmount ?? listing.reservePrice : bid.amount;
  if (game.cash < price) return { game, error: "The airline no longer has sufficient cash to complete this purchase." };
  const acquired: FleetAircraft = {
    id: id("aircraft"), registration: registration(game), aircraft: listing.aircraft,
    acquiredAt: game.gameDateTime, purchasePrice: price, condition: listing.condition,
    status: "parked", acquisitionType: "owned", market: "used", provider: listing.seller,
    monthlyPayment: 0, outstandingBalance: 0, manufactureYear: listing.manufactureYear,
    flightHours: listing.flightHours,
  };
  return {
    error: null,
    game: {
      ...game, cash: game.cash - price, fleet: [...game.fleet, acquired],
      aircraft: game.aircraft ?? listing.aircraft,
      aircraftCondition: game.aircraftCondition || listing.condition,
      auctionBids: game.auctionBids.map((item) => item.id === bid.id ? { ...item, status: "completed" } : item),
      inbox: game.inbox.map((item) => item.id === mail.id ? { ...item, status: "resolved", actions: [] } : item),
    },
  };
}

export function markMessageRead(game: AirlineState, messageId: string) {
  return { ...game, inbox: game.inbox.map((item) => item.id === messageId && item.status === "unread" ? { ...item, status: "read" } : item) };
}
