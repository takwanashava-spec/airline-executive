import { calculateBlockTime } from "@/lib/airport-system";
import type { Hub, RouteSeed } from "@/lib/game-data";
import type { AirlineState, InboxMessage, RoutePlan, SlotApplication } from "@/types/game";

const DAY_MS = 86_400_000;

export type RoutePlanInput = {
  destination: Hub;
  aircraftId: string;
  weeklyFlights: number;
  baseFare: number;
  departureTime: string;
  operatingDays: number[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function routeDistance(from: Hub, to: Hub) {
  const lat1 = ((from.latitude ?? 0) * Math.PI) / 180;
  const lat2 = ((to.latitude ?? 0) * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = (((to.longitude ?? 0) - (from.longitude ?? 0)) * Math.PI) / 180;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.max(80, Math.round(6_371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))));
}

export function routeMarketAnalysis(from: Hub, to: Hub) {
  const distance = routeDistance(from, to);
  const demand = Math.round(((from.passengerDemand ?? 50) + (to.passengerDemand ?? 50)) / 2);
  const pressure = to.slotPressure === "High" ? 18 : to.slotPressure === "Medium" ? 9 : 2;
  const competitionScore = demand + pressure;
  const competition = competitionScore >= 96 ? "High" : competitionScore >= 72 ? "Medium" : "Low";
  const suggestedFare = Math.round((720 + distance * 1.38 + demand * 4) / 10) * 10;
  return { distance, demand, competition, suggestedFare } as const;
}

function mail(game: AirlineState, input: Omit<InboxMessage, "id" | "receivedAt" | "status">): InboxMessage {
  return { ...input, id: id("mail"), receivedAt: game.gameDateTime, status: "unread" };
}

function scheduleConflict(game: AirlineState, aircraftId: string, days: number[], time: string) {
  return game.routePlans.some((plan) => plan.status === "active" && plan.aircraftId === aircraftId && plan.departureTime === time && plan.operatingDays.some((day) => days.includes(day)));
}

export function submitSlotApplication(game: AirlineState, input: RoutePlanInput) {
  const aircraft = game.fleet.find((item) => item.id === input.aircraftId);
  if (!aircraft) return { game, error: "Select an aircraft for this route." };
  if ((aircraft.inductionStage ?? "not-started") !== "complete" || aircraft.status !== "parked") return { game, error: "The selected aircraft must complete induction and be parked before assignment." };
  if (input.destination.code === game.hub.code) return { game, error: "Origin and destination must be different airports." };
  const analysis = routeMarketAnalysis(game.hub, input.destination);
  if (analysis.distance > aircraft.aircraft.range) return { game, error: `${aircraft.aircraft.model} does not have sufficient range for this route.` };
  if (!Number.isFinite(input.baseFare) || input.baseFare <= 0) return { game, error: "Enter a valid fare." };
  if (!Number.isFinite(input.weeklyFlights) || input.weeklyFlights < 1 || input.weeklyFlights > 21) return { game, error: "Weekly frequency must be between 1 and 21 departures." };
  if (!input.operatingDays.length) return { game, error: "Select at least one operating day." };
  if (scheduleConflict(game, input.aircraftId, input.operatingDays, input.departureTime)) return { game, error: "This aircraft already has a service at that time on one or more selected days." };

  const planId = id("route-plan");
  const applicationId = id("slot-application");
  const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
  const plan: RoutePlan = { id: planId, from: game.hub.code, destination: input.destination, ...analysis, blockTime: calculateBlockTime(analysis.distance, aircraft.aircraft.cruiseSpeed, input.destination.slotPressure), weeklyFlights: Math.round(input.weeklyFlights), baseFare: Math.round(input.baseFare), departureTime: input.departureTime, operatingDays: [...input.operatingDays].sort(), aircraftId: input.aircraftId, createdAt: game.gameDateTime, status: "slots-pending" };
  const application: SlotApplication = { id: applicationId, routePlanId: planId, submittedAt: game.gameDateTime, decisionAt, status: "pending", requestedTime: input.departureTime };
  const confirmation = mail(game, { threadId: applicationId, category: "network", senderName: "Airport Coordination Office", senderCompany: `${input.destination.name} Slot Coordination`, subject: `Slot request received: ${game.hub.code}–${input.destination.code}`, body: `Dear ${game.ceoName},\n\nWe acknowledge your request for ${input.weeklyFlights} weekly departures arriving from ${game.hub.code}, with a requested departure time of ${input.departureTime} UTC. Our coordination decision will be issued within one game day.\n\nRegards,\nAirport Coordination Office`, priority: "normal", relatedBidId: applicationId, actions: [] });
  return { error: null, game: { ...game, routePlans: [plan, ...game.routePlans], slotApplications: [application, ...game.slotApplications], inbox: [confirmation, ...game.inbox] } };
}

function shiftTime(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours * 60 + mins + minutes + 1_440) % 1_440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function processSlotApplications(game: AirlineState, targetTime: string) {
  const now = Date.parse(targetTime);
  let plans = game.routePlans;
  let inbox = game.inbox;
  const applications = game.slotApplications.map((application) => {
    if (application.status !== "pending" || Date.parse(application.decisionAt) > now) return application;
    const plan = plans.find((item) => item.id === application.routePlanId);
    if (!plan) return { ...application, status: "rejected" as const };
    const availability = plan.destination.availableSlotsPercent ?? (plan.destination.slotPressure === "High" ? 8 : 30);
    const rejected = availability <= 3;
    const countered = !rejected && (availability < 15 || plan.destination.slotPressure === "High");
    const status = rejected ? "rejected" as const : countered ? "countered" as const : "approved" as const;
    const offeredTime = countered ? shiftTime(application.requestedTime, 90) : application.requestedTime;
    plans = plans.map((item) => item.id === plan.id ? { ...item, status: rejected ? "rejected" : "slots-offered", departureTime: offeredTime } : item);
    inbox = [mail({ ...game, gameDateTime: targetTime }, { threadId: application.id, category: "network", senderName: "Airport Coordination Office", senderCompany: `${plan.destination.name} Slot Coordination`, subject: rejected ? `Slot request declined: ${game.hub.code}–${plan.destination.code}` : countered ? `Alternative slots offered: ${game.hub.code}–${plan.destination.code}` : `Slots approved: ${game.hub.code}–${plan.destination.code}`, body: rejected ? `Dear ${game.ceoName},\n\nCurrent declared capacity does not allow us to accommodate the requested programme. You may submit a new application with a different schedule.\n\nRegards,\nAirport Coordination Office` : `Dear ${game.ceoName},\n\nWe can offer ${plan.weeklyFlights} weekly movements at ${offeredTime} UTC. Please accept the allocation to place the route into service, or withdraw the request.\n\nRegards,\nAirport Coordination Office`, priority: rejected ? "important" : "normal", relatedBidId: application.id, actions: rejected ? [] : [{ id: "accept", label: countered ? "Accept alternative slots" : "Accept and launch route" }, { id: "withdraw", label: "Decline allocation" }] }), ...inbox];
    return { ...application, status, offeredTime };
  });
  return { ...game, routePlans: plans, slotApplications: applications, inbox };
}

export function respondToSlotMessage(game: AirlineState, messageId: string, action: "accept" | "revise" | "withdraw") {
  const message = game.inbox.find((item) => item.id === messageId && item.category === "network");
  const application = game.slotApplications.find((item) => item.id === message?.relatedBidId);
  const plan = game.routePlans.find((item) => item.id === application?.routePlanId);
  if (!message || !application || !plan) return { game, error: "This slot correspondence is no longer available." };
  const resolveMail = game.inbox.map((item) => item.id === messageId ? { ...item, status: "resolved" as const, actions: [] } : item);
  if (action === "withdraw") return { error: null, game: { ...game, inbox: resolveMail, slotApplications: game.slotApplications.map((item) => item.id === application.id ? { ...item, status: "withdrawn" } : item), routePlans: game.routePlans.map((item) => item.id === plan.id ? { ...item, status: "withdrawn" } : item) } };
  if (action === "revise") return { game, error: "Submit a new route plan from Network Planning to request a revised time." };
  const aircraft = game.fleet.find((item) => item.id === plan.aircraftId);
  if (!aircraft || aircraft.status !== "parked") return { game, error: "The assigned aircraft is no longer available." };
  const activeSeed: RouteSeed = { from: plan.from, to: plan.destination.code, city: plan.destination.city, distance: plan.distance, blockTime: plan.blockTime, baseFare: plan.baseFare, weeklyFlights: plan.weeklyFlights, demand: plan.demand, coordinates: plan.destination.coordinates };
  return { error: null, game: { ...game, route: game.route ?? activeSeed, aircraft: game.aircraft ?? aircraft.aircraft, routePlans: game.routePlans.map((item) => item.id === plan.id ? { ...item, status: "active" } : item), slotApplications: game.slotApplications.map((item) => item.id === application.id ? { ...item, status: "accepted" } : item), fleet: game.fleet.map((item) => item.id === aircraft.id ? { ...item, status: "active", baseCode: game.hub.code } : item), inbox: resolveMail } };
}
