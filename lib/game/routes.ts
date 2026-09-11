import { calculateBlockTime } from "@/lib/airport-system";
import type { Hub, RouteSeed } from "@/lib/game-data";
import type { AirlineState, InboxMessage, RoutePlan, SlotApplication } from "@/types/game";

const DAY_MS = 86_400_000;
const WEEK_MINUTES = 10_080;

export type RoutePlanInput = {
  destination: Hub;
  aircraftId: string;
  weeklyFlights: number;
  baseFare: number;
  departureTime: string;
  returnDepartureTime: string;
  turnaroundMinutes: number;
  operatingDays: number[];
};

export type ScheduleIssue = {
  field: "aircraft" | "route" | "frequency" | "fare" | "days" | "turnaround" | "return" | "conflict";
  message: string;
};

export type RotationTimes = {
  outboundDeparture: string;
  outboundArrival: string;
  returnDeparture: string;
  returnArrival: string;
  nextAvailable: string;
  crossesMidnight: boolean;
  durationMinutes: number;
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function timeMinutes(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? hours * 60 + minutes : Number.NaN;
}

export function formatScheduleTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1_440) + 1_440) % 1_440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function blockMinutes(blockTime: string) {
  const match = /(?:(\d+)h)?\s*(\d+)m/.exec(blockTime);
  return match ? Number(match[1] ?? 0) * 60 + Number(match[2]) : 0;
}

function absoluteReturnMinutes(outboundDeparture: number, returnTime: string) {
  let value = timeMinutes(returnTime);
  while (value <= outboundDeparture) value += 1_440;
  return value;
}

export function calculateRotationTimes(
  departureTime: string,
  returnDepartureTime: string,
  routeBlockMinutes: number,
  aircraftTurnaroundMinutes: number,
): RotationTimes | null {
  const outbound = timeMinutes(departureTime);
  if (!Number.isFinite(outbound) || !Number.isFinite(timeMinutes(returnDepartureTime))) return null;
  const inboundDeparture = absoluteReturnMinutes(outbound, returnDepartureTime);
  const outboundArrival = outbound + routeBlockMinutes;
  const inboundArrival = inboundDeparture + routeBlockMinutes;
  const nextAvailable = inboundArrival + aircraftTurnaroundMinutes;
  return {
    outboundDeparture: formatScheduleTime(outbound),
    outboundArrival: formatScheduleTime(outboundArrival),
    returnDeparture: formatScheduleTime(inboundDeparture),
    returnArrival: formatScheduleTime(inboundArrival),
    nextAvailable: formatScheduleTime(nextAvailable),
    crossesMidnight: nextAvailable >= 1_440,
    durationMinutes: nextAvailable - outbound,
  };
}

export function routeDistance(from: Hub, to: Hub) {
  const lat1 = ((from.latitude ?? 0) * Math.PI) / 180;
  const lat2 = ((to.latitude ?? 0) * Math.PI) / 180;
  const deltaLat = lat2 - lat1;
  const deltaLon = (((to.longitude ?? 0) - (from.longitude ?? 0)) * Math.PI) / 180;
  const value = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
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

function createMail(game: AirlineState, input: Omit<InboxMessage, "id" | "receivedAt" | "status">): InboxMessage {
  return { ...input, id: id("mail"), receivedAt: game.gameDateTime, status: "unread" };
}

function makeFlightNumbers(routeIndex: number, airlineCode: string) {
  const number = 101 + routeIndex * 2;
  return { outbound: `${airlineCode}${number}`, inbound: `${airlineCode}${number + 1}` };
}

function planInterval(plan: RoutePlan, day: number) {
  const departure = timeMinutes(plan.departureTime);
  const routeMinutes = blockMinutes(plan.blockTime);
  const returnDeparture = absoluteReturnMinutes(
    departure,
    plan.returnDepartureTime || formatScheduleTime(departure + routeMinutes + (plan.turnaroundMinutes || 30)),
  );
  return {
    start: day * 1_440 + departure,
    end: day * 1_440 + returnDeparture + routeMinutes + (plan.turnaroundMinutes || 30),
  };
}

function intervalsOverlap(first: { start: number; end: number }, second: { start: number; end: number }) {
  return first.start < second.end && second.start < first.end;
}

function scheduleConflict(game: AirlineState, candidate: RoutePlan) {
  const existingPlans = game.routePlans.filter((plan) =>
    plan.id !== candidate.id &&
    plan.aircraftId === candidate.aircraftId &&
    ["slots-pending", "slots-offered", "active"].includes(plan.status),
  );
  return existingPlans.some((existing) => existing.operatingDays.some((existingDay) => {
    const existingInterval = planInterval(existing, existingDay);
    return candidate.operatingDays.some((candidateDay) => {
      const candidateInterval = planInterval(candidate, candidateDay);
      return [-WEEK_MINUTES, 0, WEEK_MINUTES].some((offset) => intervalsOverlap(existingInterval, {
        start: candidateInterval.start + offset,
        end: candidateInterval.end + offset,
      }));
    });
  }));
}

function buildCandidatePlan(game: AirlineState, input: RoutePlanInput, routeId: string): RoutePlan | null {
  const aircraft = game.fleet.find((item) => item.id === input.aircraftId);
  if (!aircraft) return null;
  const analysis = routeMarketAnalysis(game.hub, input.destination);
  const numbers = makeFlightNumbers(game.routePlans.length, game.iata);
  return {
    id: routeId,
    from: game.hub.code,
    destination: input.destination,
    ...analysis,
    blockTime: calculateBlockTime(analysis.distance, aircraft.aircraft.cruiseSpeed, input.destination.slotPressure),
    weeklyFlights: input.operatingDays.length,
    baseFare: Math.round(input.baseFare),
    departureTime: input.departureTime,
    returnDepartureTime: input.returnDepartureTime,
    turnaroundMinutes: Math.round(input.turnaroundMinutes),
    operatingDays: [...new Set(input.operatingDays)].sort(),
    aircraftId: input.aircraftId,
    outboundFlightNumber: numbers.outbound,
    returnFlightNumber: numbers.inbound,
    createdAt: game.gameDateTime,
    status: "draft",
  };
}

export function validateRouteSchedule(game: AirlineState, input: RoutePlanInput): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];
  const aircraft = game.fleet.find((item) => item.id === input.aircraftId);
  if (!aircraft) return [{ field: "aircraft", message: "Select an aircraft for this rotation." }];
  if ((aircraft.inductionStage ?? "not-started") !== "complete" || !["parked", "active"].includes(aircraft.status)) {
    issues.push({ field: "aircraft", message: "The aircraft must complete induction and be available for scheduling." });
  }
  if (input.destination.code === game.hub.code) issues.push({ field: "route", message: "Origin and destination must be different airports." });
  const analysis = routeMarketAnalysis(game.hub, input.destination);
  if (analysis.distance > aircraft.aircraft.range) issues.push({ field: "route", message: `${aircraft.aircraft.model} does not have enough range for this route.` });
  if (!Number.isFinite(input.baseFare) || input.baseFare <= 0) issues.push({ field: "fare", message: "Enter a valid one-way fare." });
  if (!input.operatingDays.length) issues.push({ field: "days", message: "Select at least one operating day." });
  if (input.weeklyFlights !== input.operatingDays.length) issues.push({ field: "frequency", message: "Weekly departures must match the selected operating days." });
  if (input.turnaroundMinutes < aircraft.aircraft.turnaround) issues.push({ field: "turnaround", message: `${aircraft.aircraft.model} requires at least ${aircraft.aircraft.turnaround} minutes at the destination.` });

  const blockTime = calculateBlockTime(analysis.distance, aircraft.aircraft.cruiseSpeed, input.destination.slotPressure);
  const departure = timeMinutes(input.departureTime);
  const returnDeparture = Number.isFinite(departure) ? absoluteReturnMinutes(departure, input.returnDepartureTime) : Number.NaN;
  const earliestReturn = departure + blockMinutes(blockTime) + input.turnaroundMinutes;
  if (!Number.isFinite(departure) || !Number.isFinite(returnDeparture)) {
    issues.push({ field: "return", message: "Enter valid outbound and return departure times." });
  } else if (returnDeparture < earliestReturn) {
    issues.push({ field: "return", message: `The return flight cannot leave before ${formatScheduleTime(earliestReturn)} UTC after arrival and turnaround.` });
  }

  const candidate = buildCandidatePlan(game, input, "schedule-validation");
  if (candidate && scheduleConflict(game, candidate)) issues.push({ field: "conflict", message: "This rotation overlaps another service assigned to the same aircraft." });
  return issues;
}

export function submitSlotApplication(game: AirlineState, input: RoutePlanInput) {
  const issues = validateRouteSchedule(game, input);
  if (issues.length) return { game, error: issues[0].message };
  const planId = id("route-plan");
  const applicationId = id("slot-application");
  const decisionAt = new Date(Date.parse(game.gameDateTime) + DAY_MS).toISOString();
  const candidate = buildCandidatePlan(game, input, planId);
  if (!candidate) return { game, error: "Select an aircraft for this rotation." };
  const plan: RoutePlan = { ...candidate, status: "slots-pending" };
  const application: SlotApplication = {
    id: applicationId,
    routePlanId: planId,
    submittedAt: game.gameDateTime,
    decisionAt,
    status: "pending",
    requestedTime: input.departureTime,
    requestedReturnTime: input.returnDepartureTime,
  };
  const confirmation = createMail(game, {
    threadId: applicationId,
    category: "network",
    senderName: "Airport Coordination Office",
    senderCompany: `${input.destination.name} Slot Coordination`,
    subject: `Slot request received: ${game.hub.code}–${input.destination.code}`,
    body: `Dear ${game.ceoName},\n\nWe acknowledge the coordinated request for ${plan.outboundFlightNumber}/${plan.returnFlightNumber}, operating ${plan.weeklyFlights} weekly rotations. The requested slot sequence is ${game.hub.code} departure ${plan.departureTime}, ${input.destination.code} arrival ${calculateRotationTimes(plan.departureTime, plan.returnDepartureTime, blockMinutes(plan.blockTime), plan.turnaroundMinutes)?.outboundArrival}, ${input.destination.code} departure ${plan.returnDepartureTime}, and ${game.hub.code} arrival ${calculateRotationTimes(plan.departureTime, plan.returnDepartureTime, blockMinutes(plan.blockTime), plan.turnaroundMinutes)?.returnArrival}, all UTC. A decision will be issued within one game day.\n\nRegards,\nAirport Coordination Office`,
    priority: "normal",
    relatedBidId: applicationId,
    actions: [],
  });
  return {
    error: null,
    game: {
      ...game,
      routePlans: [plan, ...game.routePlans],
      slotApplications: [application, ...game.slotApplications],
      inbox: [confirmation, ...game.inbox],
    },
  };
}

function shiftTime(time: string, minutes: number) {
  return formatScheduleTime(timeMinutes(time) + minutes);
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
    const offeredReturnTime = countered ? shiftTime(application.requestedReturnTime, 90) : application.requestedReturnTime;
    plans = plans.map((item) => item.id === plan.id ? {
      ...item,
      status: rejected ? "rejected" : "slots-offered",
      departureTime: offeredTime,
      returnDepartureTime: offeredReturnTime,
    } : item);
    const rotation = calculateRotationTimes(offeredTime, offeredReturnTime, blockMinutes(plan.blockTime), plan.turnaroundMinutes);
    inbox = [createMail({ ...game, gameDateTime: targetTime }, {
      threadId: application.id,
      category: "network",
      senderName: "Airport Coordination Office",
      senderCompany: `${plan.destination.name} Slot Coordination`,
      subject: rejected ? `Slot request declined: ${game.hub.code}–${plan.destination.code}` : countered ? `Alternative rotation offered: ${game.hub.code}–${plan.destination.code}` : `Full rotation approved: ${game.hub.code}–${plan.destination.code}`,
      body: rejected
        ? `Dear ${game.ceoName},\n\nDeclared capacity cannot accommodate the requested four-slot rotation. You may prepare a new timetable and submit another application.\n\nRegards,\nAirport Coordination Office`
        : `Dear ${game.ceoName},\n\nWe can allocate the complete ${plan.outboundFlightNumber}/${plan.returnFlightNumber} rotation: ${game.hub.code} departure ${offeredTime}, ${plan.destination.code} arrival ${rotation?.outboundArrival}, ${plan.destination.code} departure ${offeredReturnTime}, and ${game.hub.code} arrival ${rotation?.returnArrival}, all UTC. Accepting this allocation will publish the timetable and place the aircraft into active service.\n\nRegards,\nAirport Coordination Office`,
      priority: rejected ? "important" : "normal",
      relatedBidId: application.id,
      actions: rejected ? [] : [
        { id: "accept", label: countered ? "Accept alternative rotation" : "Accept and publish timetable" },
        { id: "withdraw", label: "Decline allocation" },
      ],
    }), ...inbox];
    return { ...application, status, offeredTime, offeredReturnTime };
  });
  return { ...game, routePlans: plans, slotApplications: applications, inbox };
}

export function respondToSlotMessage(game: AirlineState, messageId: string, action: "accept" | "revise" | "withdraw") {
  const message = game.inbox.find((item) => item.id === messageId && item.category === "network");
  const application = game.slotApplications.find((item) => item.id === message?.relatedBidId);
  const plan = game.routePlans.find((item) => item.id === application?.routePlanId);
  if (!message || !application || !plan) return { game, error: "This slot correspondence is no longer available." };
  const resolvedInbox = game.inbox.map((item) => item.id === messageId ? { ...item, status: "resolved" as const, actions: [] } : item);
  if (action === "withdraw") {
    return {
      error: null,
      game: {
        ...game,
        inbox: resolvedInbox,
        slotApplications: game.slotApplications.map((item) => item.id === application.id ? { ...item, status: "withdrawn" } : item),
        routePlans: game.routePlans.map((item) => item.id === plan.id ? { ...item, status: "withdrawn" } : item),
      },
    };
  }
  if (action === "revise") return { game, error: "Prepare a revised rotation in Network Planning and submit a new slot request." };
  const aircraft = game.fleet.find((item) => item.id === plan.aircraftId);
  if (!aircraft || !["parked", "active"].includes(aircraft.status)) return { game, error: "The assigned aircraft is no longer available." };
  if (scheduleConflict(game, plan)) return { game, error: "This rotation now conflicts with another published aircraft schedule." };
  const activeSeed: RouteSeed = {
    from: plan.from,
    to: plan.destination.code,
    city: plan.destination.city,
    distance: plan.distance,
    blockTime: plan.blockTime,
    baseFare: plan.baseFare,
    weeklyFlights: plan.weeklyFlights,
    demand: plan.demand,
    coordinates: plan.destination.coordinates,
  };
  return {
    error: null,
    game: {
      ...game,
      route: game.route ?? activeSeed,
      aircraft: game.aircraft ?? aircraft.aircraft,
      routePlans: game.routePlans.map((item) => item.id === plan.id ? { ...item, status: "active" } : item),
      slotApplications: game.slotApplications.map((item) => item.id === application.id ? { ...item, status: "accepted" } : item),
      fleet: game.fleet.map((item) => item.id === aircraft.id ? { ...item, status: "active", baseCode: game.hub.code } : item),
      inbox: resolvedInbox,
    },
  };
}

export function setRouteSuspended(game: AirlineState, routePlanId: string, suspended: boolean) {
  const plan = game.routePlans.find((item) => item.id === routePlanId);
  if (!plan || !["active", "suspended"].includes(plan.status)) return { game, error: "Published route could not be found." };
  const aircraft = game.fleet.find((item) => item.id === plan.aircraftId);
  if (!suspended) {
    if (!aircraft || !["parked", "active"].includes(aircraft.status) || aircraft.inductionStage !== "complete") {
      return { game, error: "The assigned aircraft is not available to restore this schedule." };
    }
    if (scheduleConflict(game, plan)) return { game, error: "This schedule now overlaps another active rotation on the aircraft." };
  }
  const nextStatus = suspended ? "suspended" as const : "active" as const;
  const routePlans = game.routePlans.map((item) => item.id === plan.id ? { ...item, status: nextStatus } : item);
  const aircraftStillActive = routePlans.some((item) => item.aircraftId === plan.aircraftId && item.status === "active");
  const fleet = game.fleet.map((item) => item.id === plan.aircraftId ? { ...item, status: aircraftStillActive ? "active" as const : "parked" as const } : item);
  const notice = createMail(game, {
    threadId: plan.id,
    category: "network",
    senderName: "Network Control",
    senderCompany: game.airlineName,
    subject: `${plan.from}–${plan.destination.code} schedule ${suspended ? "suspended" : "restored"}`,
    body: `Dear ${game.ceoName},\n\nThe ${plan.outboundFlightNumber}/${plan.returnFlightNumber} rotation has been ${suspended ? "removed from sale and suspended" : "restored to the published timetable"}.\n\nRegards,\nNetwork Control`,
    priority: "normal",
    relatedBidId: plan.id,
    actions: [],
  });
  return {
    error: null,
    game: {
      ...game,
      routePlans,
      fleet,
      inbox: [notice, ...game.inbox],
    },
  };
}
