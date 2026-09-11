import { aircraft, type Aircraft } from "@/lib/game-data";
import type { AirlineState, FleetAircraft, InboxMessage, UsedAircraftTransaction } from "@/types/game";

const DAY_MS = 86_400_000;

export type UsedAircraftListing = {
  id: string;
  aircraft: Aircraft;
  registration: string;
  serialNumber: string;
  manufactureYear: number;
  seller: string;
  sellerContact: string;
  location: string;
  formerOperator: string;
  flightHours: number;
  flightCycles: number;
  seats: number;
  askingPrice: number;
  marketValue: number;
  deliveryCost: number;
  expiresAt: string;
  visibleCondition: number;
  components: { airframe: number; engineOne: number; engineTwo: number; landingGear: number; avionics: number; cabin: number };
  maintenance: { lastCheck: string; nextCheck: string; nextCheckCost: number };
};

function model(name: string) {
  const item = aircraft.find((candidate) => candidate.model === name);
  if (!item) throw new Error(`Missing used aircraft model: ${name}`);
  return item;
}

export const usedAircraftListings: UsedAircraftListing[] = [
  { id: "used-atr72-zsmra", aircraft: model("ATR 72-600"), registration: "ZS-MRA", serialNumber: "MSN 1284", manufactureYear: 2016, seller: "Regional Aircraft Exchange", sellerContact: "Daniel Mokoena", location: "Johannesburg, South Africa", formerOperator: "Southern Regional Airways", flightHours: 22_460, flightCycles: 20_180, seats: 72, askingPrice: 31_800_000, marketValue: 30_900_000, deliveryCost: 180_000, expiresAt: "2026-10-18T16:00:00.000Z", visibleCondition: 82, components: { airframe: 84, engineOne: 79, engineTwo: 81, landingGear: 76, avionics: 88, cabin: 80 }, maintenance: { lastCheck: "2026-02-14", nextCheck: "2027-02-14", nextCheckCost: 2_400_000 } },
  { id: "used-atr72-fhbxp", aircraft: model("ATR 72-600"), registration: "F-HBXP", serialNumber: "MSN 1492", manufactureYear: 2019, seller: "AviaTrade Europe", sellerContact: "Claire Dubois", location: "Toulouse, France", formerOperator: "Hexagon Connect", flightHours: 13_210, flightCycles: 11_840, seats: 70, askingPrice: 39_600_000, marketValue: 38_900_000, deliveryCost: 2_950_000, expiresAt: "2026-10-22T16:00:00.000Z", visibleCondition: 90, components: { airframe: 92, engineOne: 89, engineTwo: 91, landingGear: 87, avionics: 93, cabin: 86 }, maintenance: { lastCheck: "2026-05-09", nextCheck: "2027-05-09", nextCheckCost: 2_100_000 } },
  { id: "used-e190-praze", aircraft: model("Embraer E190-E2"), registration: "PR-AZE", serialNumber: "MSN 19020019", manufactureYear: 2019, seller: "Continental Aircraft Exchange", sellerContact: "Mariana Costa", location: "São José dos Campos, Brazil", formerOperator: "Azul Coast", flightHours: 15_880, flightCycles: 9_760, seats: 100, askingPrice: 58_400_000, marketValue: 56_900_000, deliveryCost: 4_200_000, expiresAt: "2026-10-26T16:00:00.000Z", visibleCondition: 87, components: { airframe: 89, engineOne: 86, engineTwo: 83, landingGear: 90, avionics: 92, cabin: 82 }, maintenance: { lastCheck: "2026-01-18", nextCheck: "2026-12-18", nextCheckCost: 4_700_000 } },
  { id: "used-a220-cgcae", aircraft: model("Airbus A220-300"), registration: "C-GCAE", serialNumber: "MSN 55062", manufactureYear: 2018, seller: "Global Airframe Exchange", sellerContact: "Sophie Tremblay", location: "Montréal, Canada", formerOperator: "Northern Maple Air", flightHours: 18_740, flightCycles: 10_630, seats: 137, askingPrice: 74_500_000, marketValue: 72_800_000, deliveryCost: 4_850_000, expiresAt: "2026-11-02T16:00:00.000Z", visibleCondition: 85, components: { airframe: 88, engineOne: 80, engineTwo: 84, landingGear: 83, avionics: 91, cabin: 79 }, maintenance: { lastCheck: "2025-12-02", nextCheck: "2026-11-20", nextCheckCost: 6_800_000 } },
  { id: "used-a320-ecneo", aircraft: model("Airbus A320neo"), registration: "EC-NEO", serialNumber: "MSN 8864", manufactureYear: 2019, seller: "Iberian Aviation Assets", sellerContact: "Javier Ortega", location: "Madrid, Spain", formerOperator: "Costa Europa", flightHours: 16_390, flightCycles: 7_920, seats: 180, askingPrice: 89_700_000, marketValue: 87_500_000, deliveryCost: 3_400_000, expiresAt: "2026-11-05T16:00:00.000Z", visibleCondition: 88, components: { airframe: 90, engineOne: 87, engineTwo: 85, landingGear: 86, avionics: 93, cabin: 84 }, maintenance: { lastCheck: "2026-03-26", nextCheck: "2027-03-26", nextCheckCost: 7_200_000 } },
  { id: "used-b738-n808x", aircraft: model("Boeing 737-8"), registration: "N808GX", serialNumber: "MSN 62918", manufactureYear: 2020, seller: "NorthStar Commercial Aircraft", sellerContact: "Rachel Bennett", location: "Dallas, United States", formerOperator: "Frontier Republic", flightHours: 12_640, flightCycles: 6_410, seats: 178, askingPrice: 92_800_000, marketValue: 90_600_000, deliveryCost: 5_100_000, expiresAt: "2026-11-09T16:00:00.000Z", visibleCondition: 91, components: { airframe: 93, engineOne: 90, engineTwo: 88, landingGear: 89, avionics: 94, cabin: 87 }, maintenance: { lastCheck: "2026-04-11", nextCheck: "2027-04-11", nextCheckCost: 7_600_000 } },
];

function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function mail(game: AirlineState, input: Omit<InboxMessage, "id" | "receivedAt" | "status">): InboxMessage { return { ...input, id: id("mail"), receivedAt: game.gameDateTime, status: "unread" }; }
function active(game: AirlineState, listingId: string) { return game.usedAircraftTransactions.some((item) => item.listingId === listingId && !["reported", "rejected", "withdrawn", "completed"].includes(item.status)); }

export function toggleUsedAircraftWatchlist(game: AirlineState, listingId: string) {
  const exists = game.usedAircraftWatchlist.includes(listingId);
  return { ...game, usedAircraftWatchlist: exists ? game.usedAircraftWatchlist.filter((id) => id !== listingId) : [...game.usedAircraftWatchlist, listingId] };
}

export function requestUsedAircraftInspection(game: AirlineState, listingId: string, inspectionType: "records" | "physical") {
  const listing = usedAircraftListings.find((item) => item.id === listingId);
  if (!listing) return { game, error: "This aircraft is no longer listed." };
  const cost = inspectionType === "records" ? 180_000 : 850_000;
  if (game.cash < cost) return { game, error: "The airline cannot fund this inspection." };
  const days = inspectionType === "records" ? 1 : 3;
  const decisionAt = new Date(Date.parse(game.gameDateTime) + days * DAY_MS).toISOString();
  const transaction: UsedAircraftTransaction = { id: id("inspection"), listingId, kind: "inspection", status: "pending", submittedAt: game.gameDateTime, decisionAt, amount: cost, inspectionType };
  return { error: null, game: { ...game, cash: game.cash - cost, usedAircraftTransactions: [...game.usedAircraftTransactions, transaction], inbox: [mail(game, { threadId: transaction.id, category: "used-aircraft", senderName: listing.sellerContact, senderCompany: listing.seller, subject: `Inspection instruction confirmed: ${listing.registration}`, body: `Dear ${game.ceoName},\n\nWe confirm your instruction for a ${inspectionType === "records" ? "records review" : "physical pre-purchase inspection"} of ${listing.aircraft.model} ${listing.registration}. The report is expected within ${days} game day${days === 1 ? "" : "s"}.\n\nKind regards,\n${listing.sellerContact}\nAircraft Sales`, priority: "important", responseDeadline: decisionAt, relatedBidId: transaction.id, actions: [] }), ...game.inbox] } };
}

export function submitUsedAircraftOffer(game: AirlineState, listingId: string, amount: number) {
  const listing = usedAircraftListings.find((item) => item.id === listingId);
  if (!listing) return { game, error: "This aircraft is no longer listed." };
  if (!Number.isFinite(amount) || amount <= 0 || amount > game.cash) return { game, error: "Enter an offer the airline can fund." };
  if (active(game, listingId)) return { game, error: "This aircraft already has an active transaction." };
  const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
  const transaction: UsedAircraftTransaction = { id: id("offer"), listingId, kind: "offer", status: "pending", submittedAt: game.gameDateTime, decisionAt, amount: Math.round(amount) };
  return { error: null, game: { ...game, usedAircraftTransactions: [...game.usedAircraftTransactions, transaction], inbox: [mail(game, { threadId: transaction.id, category: "used-aircraft", senderName: listing.sellerContact, senderCompany: listing.seller, subject: `Offer received: ${listing.aircraft.model} ${listing.serialNumber}`, body: `Dear ${game.ceoName},\n\nWe acknowledge ${game.airlineName}'s offer of ${Math.round(amount).toLocaleString("en-ZA")} for ${listing.registration}. The owner will respond within one game day.\n\nKind regards,\n${listing.sellerContact}\nAircraft Sales`, priority: "important", responseDeadline: decisionAt, relatedBidId: transaction.id, actions: [] }), ...game.inbox] } };
}

export function applyForUsedAircraftFinance(game: AirlineState, listingId: string) {
  const listing = usedAircraftListings.find((item) => item.id === listingId);
  if (!listing) return { game, error: "This aircraft is no longer listed." };
  if (active(game, listingId)) return { game, error: "This aircraft already has an active transaction." };
  const decisionAt = new Date(Date.parse(game.gameDateTime) + 2 * DAY_MS).toISOString();
  const transaction: UsedAircraftTransaction = { id: id("finance"), listingId, kind: "finance", status: "pending", submittedAt: game.gameDateTime, decisionAt, amount: listing.askingPrice };
  return { error: null, game: { ...game, usedAircraftTransactions: [...game.usedAircraftTransactions, transaction], inbox: [mail(game, { threadId: transaction.id, category: "used-aircraft", senderName: "Michael Chen", senderCompany: "Aviation Finance Corporation", subject: `Finance application received: ${listing.registration}`, body: `Dear ${game.ceoName},\n\nYour application to finance the acquisition of ${listing.registration} has entered credit review. A decision is expected within two game days.\n\nYours sincerely,\nMichael Chen\nDirector, Aviation Finance`, priority: "important", responseDeadline: decisionAt, relatedBidId: transaction.id, actions: [] }), ...game.inbox] } };
}

export function buyUsedAircraftNow(game: AirlineState, listingId: string) {
  const listing = usedAircraftListings.find((item) => item.id === listingId);
  if (!listing) return { game, error: "This aircraft is no longer listed." };
  const transaction: UsedAircraftTransaction = { id: id("purchase"), listingId, kind: "purchase", status: "accepted", submittedAt: game.gameDateTime, decisionAt: game.gameDateTime, amount: listing.askingPrice };
  const withTransaction = { ...game, usedAircraftTransactions: [...game.usedAircraftTransactions, transaction] };
  return completeUsedAircraftAcquisition(withTransaction, transaction, false);
}

export function processUsedAircraftTransactions(game: AirlineState, targetTime: string) {
  const now = Date.parse(targetTime);
  let inbox = game.inbox;
  let inspected = game.inspectedUsedAircraft;
  let fleet = game.fleet;
  const transactions = game.usedAircraftTransactions.map((transaction) => {
    const listing = usedAircraftListings.find((item) => item.id === transaction.listingId);
    if (!listing) return transaction;
    if (transaction.status === "delivery" && transaction.deliveryAt && Date.parse(transaction.deliveryAt) <= now) {
      fleet = fleet.map((item) => item.id === `used-${transaction.id}` ? { ...item, status: "parked" as const } : item);
      inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: transaction.id, category: "used-aircraft", senderName: listing.sellerContact, senderCompany: listing.seller, subject: `Aircraft delivered: ${listing.aircraft.model}`, body: `Dear ${game.ceoName},\n\nDelivery of ${listing.registration} has been completed. The aircraft has entered ${game.airlineName}'s fleet and is available for induction planning.\n\nKind regards,\n${listing.sellerContact}\nAircraft Sales`, priority: "important", relatedBidId: transaction.id, actions: [] }), ...inbox];
      return { ...transaction, status: "completed" as const };
    }
    if (transaction.status !== "pending" || Date.parse(transaction.decisionAt) > now) return transaction;
    if (transaction.kind === "inspection") {
      inspected = inspected.includes(listing.id) ? inspected : [...inspected, listing.id];
      const lowest = Math.min(...Object.values(listing.components));
      inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: transaction.id, category: "used-aircraft", senderName: "Aisha Naidoo", senderCompany: "Independent Aviation Surveyors", subject: `Inspection report: ${listing.registration}`, body: `Dear ${game.ceoName},\n\nOur ${transaction.inspectionType === "records" ? "records review" : "physical inspection"} is complete. Airframe condition is ${listing.components.airframe}%; engine condition is ${listing.components.engineOne}% / ${listing.components.engineTwo}%; landing gear is ${listing.components.landingGear}%. The lowest assessed component is ${lowest}%. The next scheduled major check is ${listing.maintenance.nextCheck}, with an estimated cost of ${listing.maintenance.nextCheckCost.toLocaleString("en-ZA")}.\n\nRegards,\nAisha Naidoo\nLead Aviation Surveyor`, priority: lowest < 80 ? "urgent" : "important", relatedBidId: transaction.id, actions: [] }), ...inbox];
      return { ...transaction, status: "reported" as const };
    }
    if (transaction.kind === "offer") {
      const accepted = transaction.amount >= listing.askingPrice * .95;
      const countered = !accepted && transaction.amount >= listing.askingPrice * .82;
      const counterAmount = countered ? Math.round(listing.askingPrice * .97) : undefined;
      const status = accepted ? "accepted" as const : countered ? "countered" as const : "rejected" as const;
      const decision = accepted ? `The owner accepts your offer of ${transaction.amount.toLocaleString("en-ZA")}.` : countered ? `The owner cannot accept your offer, but will sell the aircraft for ${counterAmount!.toLocaleString("en-ZA")}.` : "The owner has declined your offer.";
      inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: transaction.id, category: "used-aircraft", senderName: listing.sellerContact, senderCompany: listing.seller, subject: `${accepted ? "Offer accepted" : countered ? "Counteroffer" : "Offer declined"}: ${listing.registration}`, body: `Dear ${game.ceoName},\n\n${decision}\n\nKind regards,\n${listing.sellerContact}\nAircraft Sales`, priority: accepted || countered ? "urgent" : "normal", responseDeadline: new Date(now + 2 * DAY_MS).toISOString(), relatedBidId: transaction.id, actions: accepted ? [{ id: "accept", label: "Complete purchase" }, { id: "withdraw", label: "Withdraw" }] : countered ? [{ id: "accept", label: "Accept counteroffer" }, { id: "revise", label: "Revise offer", requiresAmount: true }, { id: "withdraw", label: "Withdraw" }] : [{ id: "withdraw", label: "Close correspondence" }] }), ...inbox];
      return { ...transaction, status, counterAmount };
    }
    const approved = game.reputation >= 45;
    const status = approved ? "accepted" as const : "rejected" as const;
    inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: transaction.id, category: "used-aircraft", senderName: "Michael Chen", senderCompany: "Aviation Finance Corporation", subject: `${approved ? "Finance approved" : "Finance declined"}: ${listing.registration}`, body: approved ? `Dear ${game.ceoName},\n\nCredit approval has been granted for 75% of the purchase price over 60 months at 10.5% per annum. A 25% deposit is required.\n\nYours sincerely,\nMichael Chen\nDirector, Aviation Finance` : `Dear ${game.ceoName},\n\nWe regret that the finance application cannot be approved at this time.\n\nYours sincerely,\nMichael Chen\nDirector, Aviation Finance`, priority: approved ? "urgent" : "normal", responseDeadline: new Date(now + 2 * DAY_MS).toISOString(), relatedBidId: transaction.id, actions: approved ? [{ id: "accept", label: "Accept finance" }, { id: "withdraw", label: "Decline finance" }] : [{ id: "withdraw", label: "Close correspondence" }] }), ...inbox];
    return { ...transaction, status };
  });
  return { ...game, fleet, inbox, inspectedUsedAircraft: inspected, usedAircraftTransactions: transactions };
}

function registration(game: AirlineState) { const prefixes: Record<string, string> = { ZA: "ZS", ZW: "Z", GB: "G", US: "N", AU: "VH", AE: "A6", CA: "C" }; return `${prefixes[game.hub.countryCode ?? ""] ?? game.icao.slice(0, 2)}-${String(game.fleet.length + 1).padStart(3, "0")}`; }

export function respondToUsedAircraftMessage(game: AirlineState, messageId: string, action: "accept" | "revise" | "withdraw", revisedAmount?: number) {
  const message = game.inbox.find((item) => item.id === messageId);
  const transaction = game.usedAircraftTransactions.find((item) => item.id === message?.relatedBidId);
  const listing = usedAircraftListings.find((item) => item.id === transaction?.listingId);
  if (!message || !transaction || !listing) return { game, error: "This aircraft correspondence is no longer actionable." };
  const inbox = game.inbox.map((item) => item.id === message.id ? { ...item, status: "resolved" as const, actions: [] } : item);
  if (action === "withdraw") return { error: null, game: { ...game, inbox, usedAircraftTransactions: game.usedAircraftTransactions.map((item) => item.id === transaction.id ? { ...item, status: "withdrawn" } : item) } };
  if (action === "revise") {
    const amount = Math.round(revisedAmount ?? 0);
    if (amount <= transaction.amount || amount > game.cash) return { game, error: "Enter a higher revised offer that the airline can fund." };
    const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
    return { error: null, game: { ...game, inbox, usedAircraftTransactions: game.usedAircraftTransactions.map((item) => item.id === transaction.id ? { ...item, amount, counterAmount: undefined, status: "pending", submittedAt: game.gameDateTime, decisionAt } : item) } };
  }
  return completeUsedAircraftAcquisition({ ...game, inbox }, transaction, transaction.kind === "finance");
}

function completeUsedAircraftAcquisition(game: AirlineState, transaction: UsedAircraftTransaction, financed: boolean) {
  const listing = usedAircraftListings.find((item) => item.id === transaction.listingId);
  if (!listing) return { game, error: "This aircraft is no longer available." };
  const price = transaction.counterAmount ?? transaction.amount;
  const upfront = financed ? Math.round(price * .25) + listing.deliveryCost : price + listing.deliveryCost;
  if (game.cash < upfront) return { game, error: "The airline cannot fund the purchase and delivery costs." };
  const deliveryDays = listing.deliveryCost < 1_000_000 ? 1 : listing.deliveryCost < 4_000_000 ? 3 : 5;
  const deliveryAt = new Date(Date.parse(game.gameDateTime) + deliveryDays * DAY_MS).toISOString();
  const financedPrincipal = financed ? Math.round(price * .75) : 0;
  const monthlyPayment = financed ? Math.round(financedPrincipal * .0215) : 0;
  const acquired: FleetAircraft = { id: `used-${transaction.id}`, registration: registration(game), aircraft: listing.aircraft, acquiredAt: game.gameDateTime, purchasePrice: price, condition: listing.visibleCondition, status: "delivery", acquisitionType: financed ? "financed" : "owned", market: "used", provider: listing.seller, monthlyPayment, outstandingBalance: financedPrincipal, manufactureYear: listing.manufactureYear, flightHours: listing.flightHours };
  const updatedTransactions = game.usedAircraftTransactions.map((item) => item.id === transaction.id ? { ...item, status: "delivery" as const, deliveryAt } : item);
  return { error: null, game: { ...game, cash: game.cash - upfront, aircraft: game.aircraft ?? listing.aircraft, aircraftCondition: game.aircraftCondition || listing.visibleCondition, fleet: [...game.fleet, acquired], usedAircraftTransactions: updatedTransactions, inbox: [mail(game, { threadId: transaction.id, category: "used-aircraft", senderName: listing.sellerContact, senderCompany: listing.seller, subject: `Sale completed — delivery scheduled: ${listing.registration}`, body: `Dear ${game.ceoName},\n\nThe sale has completed and cleared funds have been received. Delivery is scheduled for ${new Date(deliveryAt).toLocaleDateString("en-ZA", { timeZone: "UTC" })}. The aircraft will remain unavailable for operations until handover.\n\nKind regards,\n${listing.sellerContact}\nAircraft Sales`, priority: "important", relatedBidId: transaction.id, actions: [] }), ...game.inbox] } };
}
