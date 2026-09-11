import { aircraft, type Aircraft } from "@/lib/game-data";
import type { AirlineState, FleetAircraft, InboxMessage, LeaseApplication } from "@/types/game";

const DAY_MS = 86_400_000;

export type Lessor = {
  id: string;
  name: string;
  headquarters: string;
  region: string;
  specialisation: string;
  riskProfile: "Flexible" | "Balanced" | "Conservative";
  minReputation: number;
};

export type LeaseOffer = {
  id: string;
  lessorId: string;
  aircraft: Aircraft;
  registration: string;
  serialNumber: string;
  manufactureYear: number;
  location: string;
  flightHours: number;
  flightCycles: number;
  condition: number;
  monthlyRate: number;
  depositMonths: number;
  maintenanceReserve: number;
  deliveryCost: number;
  termMonths: number;
  currency: "USD";
  availableAt: string;
};

function findModel(name: string) {
  const item = aircraft.find((candidate) => candidate.model === name);
  if (!item) throw new Error(`Missing lease aircraft model: ${name}`);
  return item;
}

export const lessors: Lessor[] = [
  { id: "meridian", name: "Meridian Aviation Capital", headquarters: "Dublin, Ireland", region: "Europe", specialisation: "Airbus and Boeing narrow-body aircraft", riskProfile: "Conservative", minReputation: 58 },
  { id: "nordic", name: "Nordic Regional Leasing", headquarters: "Stockholm, Sweden", region: "Europe", specialisation: "ATR and regional airline fleets", riskProfile: "Balanced", minReputation: 48 },
  { id: "horizon", name: "Horizon Aircraft Leasing", headquarters: "Singapore", region: "Asia-Pacific", specialisation: "Embraer and new-generation Airbus aircraft", riskProfile: "Conservative", minReputation: 55 },
  { id: "southern-cross", name: "Southern Cross Aviation", headquarters: "Johannesburg, South Africa", region: "Africa", specialisation: "Flexible leases for African operators", riskProfile: "Flexible", minReputation: 40 },
  { id: "pacific", name: "Pacific AeroLease", headquarters: "Sydney, Australia", region: "Asia-Pacific", specialisation: "New-generation narrow-body aircraft", riskProfile: "Balanced", minReputation: 52 },
  { id: "atlas", name: "Atlas Aircraft Partners", headquarters: "Dubai, United Arab Emirates", region: "Middle East", specialisation: "Long-range and high-capacity aircraft", riskProfile: "Conservative", minReputation: 62 },
];

export const leaseOffers: LeaseOffer[] = [
  { id: "lease-meridian-a320", lessorId: "meridian", aircraft: findModel("Airbus A320neo"), registration: "EI-MAC", serialNumber: "MSN 10842", manufactureYear: 2022, location: "Dublin, Ireland", flightHours: 6_480, flightCycles: 2_910, condition: 96, monthlyRate: 6_850_000, depositMonths: 3, maintenanceReserve: 1_290_000, deliveryCost: 3_450_000, termMonths: 96, currency: "USD", availableAt: "2026-10-01T08:00:00.000Z" },
  { id: "lease-meridian-b38m", lessorId: "meridian", aircraft: findModel("Boeing 737-8"), registration: "EI-MAX", serialNumber: "MSN 63381", manufactureYear: 2021, location: "Shannon, Ireland", flightHours: 8_920, flightCycles: 3_770, condition: 94, monthlyRate: 7_120_000, depositMonths: 3, maintenanceReserve: 1_380_000, deliveryCost: 3_600_000, termMonths: 96, currency: "USD", availableAt: "2026-09-26T08:00:00.000Z" },
  { id: "lease-nordic-atr72", lessorId: "nordic", aircraft: findModel("ATR 72-600"), registration: "SE-NRL", serialNumber: "MSN 1541", manufactureYear: 2020, location: "Stockholm, Sweden", flightHours: 11_400, flightCycles: 10_820, condition: 91, monthlyRate: 2_420_000, depositMonths: 2, maintenanceReserve: 490_000, deliveryCost: 2_100_000, termMonths: 60, currency: "USD", availableAt: "2026-09-18T08:00:00.000Z" },
  { id: "lease-horizon-e195", lessorId: "horizon", aircraft: findModel("Embraer E195-E2"), registration: "9V-HAL", serialNumber: "MSN 19020071", manufactureYear: 2023, location: "Singapore", flightHours: 4_200, flightCycles: 2_080, condition: 97, monthlyRate: 5_880_000, depositMonths: 3, maintenanceReserve: 920_000, deliveryCost: 4_650_000, termMonths: 84, currency: "USD", availableAt: "2026-10-05T08:00:00.000Z" },
  { id: "lease-sca-atr72", lessorId: "southern-cross", aircraft: findModel("ATR 72-600"), registration: "ZS-SCA", serialNumber: "MSN 1394", manufactureYear: 2017, location: "Johannesburg, South Africa", flightHours: 19_860, flightCycles: 17_420, condition: 84, monthlyRate: 2_610_000, depositMonths: 2, maintenanceReserve: 410_000, deliveryCost: 180_000, termMonths: 48, currency: "USD", availableAt: "2026-09-12T08:00:00.000Z" },
  { id: "lease-sca-e190", lessorId: "southern-cross", aircraft: findModel("Embraer E190-E2"), registration: "ZS-SCE", serialNumber: "MSN 19020022", manufactureYear: 2019, location: "Cape Town, South Africa", flightHours: 14_770, flightCycles: 9_330, condition: 88, monthlyRate: 4_380_000, depositMonths: 2, maintenanceReserve: 720_000, deliveryCost: 520_000, termMonths: 60, currency: "USD", availableAt: "2026-09-20T08:00:00.000Z" },
  { id: "lease-pacific-a220", lessorId: "pacific", aircraft: findModel("Airbus A220-300"), registration: "VH-PAL", serialNumber: "MSN 55127", manufactureYear: 2022, location: "Sydney, Australia", flightHours: 7_810, flightCycles: 4_230, condition: 95, monthlyRate: 6_130_000, depositMonths: 3, maintenanceReserve: 980_000, deliveryCost: 5_100_000, termMonths: 84, currency: "USD", availableAt: "2026-10-08T08:00:00.000Z" },
  { id: "lease-atlas-787", lessorId: "atlas", aircraft: findModel("Boeing 787-9"), registration: "A6-AAP", serialNumber: "MSN 65788", manufactureYear: 2021, location: "Dubai, UAE", flightHours: 9_440, flightCycles: 1_760, condition: 95, monthlyRate: 15_900_000, depositMonths: 4, maintenanceReserve: 2_750_000, deliveryCost: 3_900_000, termMonths: 120, currency: "USD", availableAt: "2026-10-15T08:00:00.000Z" },
];

function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function mail(game: AirlineState, input: Omit<InboxMessage, "id" | "receivedAt" | "status">): InboxMessage { return { ...input, id: id("mail"), receivedAt: game.gameDateTime, status: "unread" }; }

export function submitLeaseApplication(game: AirlineState, offerId: string) {
  const offer = leaseOffers.find((item) => item.id === offerId);
  const lessor = lessors.find((item) => item.id === offer?.lessorId);
  if (!offer || !lessor) return { game, error: "This lease offer is no longer available." };
  if (game.leaseApplications.some((item) => item.offerId === offerId && ["pending", "approved", "countered"].includes(item.status))) return { game, error: "An active application already exists for this aircraft." };
  const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
  const application: LeaseApplication = { id: id("lease-application"), offerId, submittedAt: game.gameDateTime, decisionAt, status: "pending", proposedMonthlyRate: offer.monthlyRate };
  return { error: null, game: { ...game, leaseApplications: [...game.leaseApplications, application], inbox: [mail(game, { threadId: application.id, category: "finance", senderName: "Elena Ward", senderCompany: lessor.name, subject: `Lease application received: ${offer.aircraft.model} ${offer.serialNumber}`, body: `Dear ${game.ceoName},\n\nWe acknowledge receipt of ${game.airlineName}'s application to lease ${offer.registration}. Our credit and commercial teams will provide a formal decision within one game day.\n\nYours sincerely,\nElena Ward\nVice President, Commercial Leasing`, priority: "important", responseDeadline: decisionAt, relatedBidId: application.id, actions: [] }), ...game.inbox] } };
}

export function processLeaseDecisions(game: AirlineState, targetTime: string) {
  const now = Date.parse(targetTime);
  let inbox = game.inbox;
  const applications = game.leaseApplications.map((application) => {
    if (application.status !== "pending" || Date.parse(application.decisionAt) > now) return application;
    const offer = leaseOffers.find((item) => item.id === application.offerId);
    const lessor = lessors.find((item) => item.id === offer?.lessorId);
    if (!offer || !lessor) return { ...application, status: "rejected" as const };
    const approved = game.reputation >= lessor.minReputation;
    const close = game.reputation >= lessor.minReputation - 12;
    const status = approved ? "approved" as const : close ? "countered" as const : "rejected" as const;
    const approvedRate = approved ? application.proposedMonthlyRate : Math.round(offer.monthlyRate * 1.08);
    const depositMonths = approved ? offer.depositMonths : offer.depositMonths + 1;
    const outcome = approved
      ? `We are pleased to approve your application at a monthly basic rent of ${approvedRate.toLocaleString("en-ZA")}, with a ${depositMonths}-month security deposit.`
      : close
        ? `We can approve the application subject to a monthly basic rent of ${approvedRate.toLocaleString("en-ZA")} and a ${depositMonths}-month security deposit.`
        : `Following our credit review, we are unable to approve this application at present.`;
    inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: application.id, category: "finance", senderName: "Elena Ward", senderCompany: lessor.name, subject: `${approved ? "Lease approved" : close ? "Revised lease terms" : "Lease application decision"}: ${offer.aircraft.model} ${offer.serialNumber}`, body: `Dear ${game.ceoName},\n\n${outcome}\n\nThe maintenance reserve and delivery costs remain as stated in the term sheet.\n\nYours sincerely,\nElena Ward\nVice President, Commercial Leasing`, priority: approved || close ? "urgent" : "normal", responseDeadline: new Date(now + 2 * DAY_MS).toISOString(), relatedBidId: application.id, actions: approved ? [{ id: "accept", label: "Execute lease" }, { id: "withdraw", label: "Decline terms" }] : close ? [{ id: "accept", label: "Accept revised terms" }, { id: "revise", label: "Propose monthly rate", requiresAmount: true }, { id: "withdraw", label: "Decline terms" }] : [{ id: "withdraw", label: "Close correspondence" }] }), ...inbox];
    return { ...application, status, approvedMonthlyRate: approvedRate, depositMonths };
  });
  return { ...game, leaseApplications: applications, inbox };
}

function fleetRegistration(game: AirlineState) { const prefixes: Record<string, string> = { ZA: "ZS", ZW: "Z", GB: "G", US: "N", AU: "VH", AE: "A6", SG: "9V" }; return `${prefixes[game.hub.countryCode ?? ""] ?? game.icao.slice(0, 2)}-${String(game.fleet.length + 1).padStart(3, "0")}`; }

export function respondToLeaseMessage(game: AirlineState, messageId: string, action: "accept" | "revise" | "withdraw", revisedRate?: number) {
  const message = game.inbox.find((item) => item.id === messageId);
  const application = game.leaseApplications.find((item) => item.id === message?.relatedBidId);
  const offer = leaseOffers.find((item) => item.id === application?.offerId);
  const lessor = lessors.find((item) => item.id === offer?.lessorId);
  if (!message || !application || !offer || !lessor) return { game, error: "This lease correspondence is no longer actionable." };
  const resolveMail = game.inbox.map((item) => item.id === message.id ? { ...item, status: "resolved" as const, actions: [] } : item);
  if (action === "withdraw") return { error: null, game: { ...game, leaseApplications: game.leaseApplications.map((item) => item.id === application.id ? { ...item, status: "withdrawn" } : item), inbox: resolveMail } };
  if (action === "revise") {
    const rate = Math.round(revisedRate ?? 0);
    if (rate <= 0 || rate >= (application.approvedMonthlyRate ?? offer.monthlyRate)) return { game, error: "Enter a positive monthly rate below the lessor's current proposal." };
    const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
    return { error: null, game: { ...game, leaseApplications: game.leaseApplications.map((item) => item.id === application.id ? { ...item, status: "pending", proposedMonthlyRate: rate, decisionAt } : item), inbox: resolveMail } };
  }
  const monthlyRate = application.approvedMonthlyRate ?? offer.monthlyRate;
  const depositMonths = application.depositMonths ?? offer.depositMonths;
  const upfront = monthlyRate * depositMonths + offer.deliveryCost;
  if (game.cash < upfront) return { game, error: "The airline cannot fund the security deposit and delivery costs." };
  const acquired: FleetAircraft = { id: id("aircraft"), registration: fleetRegistration(game), aircraft: offer.aircraft, acquiredAt: game.gameDateTime, purchasePrice: 0, condition: offer.condition, status: "parked", acquisitionType: "leased", market: "lessor", provider: lessor.name, monthlyPayment: monthlyRate + offer.maintenanceReserve, outstandingBalance: 0, manufactureYear: offer.manufactureYear, flightHours: offer.flightHours };
  return { error: null, game: { ...game, cash: game.cash - upfront, aircraft: game.aircraft ?? offer.aircraft, aircraftCondition: game.aircraftCondition || offer.condition, fleet: [...game.fleet, acquired], leaseApplications: game.leaseApplications.map((item) => item.id === application.id ? { ...item, status: "completed" } : item), inbox: resolveMail } };
}
