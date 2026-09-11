import type { AirlineState, CabinPreset, FleetAircraft, FleetTask, InboxMessage, InductionStage } from "@/types/game";

const DAY_MS = 86_400_000;

export type FleetAction = "advance-induction" | "configure-cabin" | "line-maintenance" | "a-check" | "c-check";

const inductionSteps: Record<Exclude<InductionStage, "not-started" | "complete">, { label: string; days: number; cost: number }> = {
  technical: { label: "Technical acceptance and records review", days: 2, cost: 1_250_000 },
  registration: { label: "Registration and insurance activation", days: 1, cost: 620_000 },
  cabin: { label: "Cabin preparation and airline livery", days: 3, cost: 2_400_000 },
  base: { label: "Base positioning and operational release", days: 1, cost: 380_000 },
};

const cabinMix: Record<CabinPreset, { economy: number; premiumEconomy: number; business: number; first: number; multiplier: number }> = {
  "high-density": { economy: 1, premiumEconomy: 0, business: 0, first: 0, multiplier: 1.1 },
  standard: { economy: 1, premiumEconomy: 0, business: 0, first: 0, multiplier: 1 },
  "two-class": { economy: .82, premiumEconomy: 0, business: .18, first: 0, multiplier: .86 },
  "three-class": { economy: .7, premiumEconomy: .18, business: .12, first: 0, multiplier: .78 },
  premium: { economy: .58, premiumEconomy: .2, business: .17, first: .05, multiplier: .68 },
};

function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function mail(game: AirlineState, aircraft: FleetAircraft, subject: string, body: string): InboxMessage { return { id: id("mail"), threadId: aircraft.id, category: "operations", senderName: "Thabo Maseko", senderCompany: `${game.airlineName} Fleet Technical`, subject, body: `Dear ${game.ceoName},\n\n${body}\n\nRegards,\nThabo Maseko\nDirector of Fleet Technical`, receivedAt: game.gameDateTime, priority: "important", status: "unread", relatedBidId: aircraft.id, actions: [] }; }

function nextStage(stage: InductionStage): Exclude<InductionStage, "not-started" | "complete"> | null {
  if (stage === "not-started") return "technical";
  if (stage === "technical") return "registration";
  if (stage === "registration") return "cabin";
  if (stage === "cabin") return "base";
  return null;
}

export function performFleetAction(game: AirlineState, aircraftId: string, action: FleetAction, option?: string) {
  const aircraft = game.fleet.find((item) => item.id === aircraftId);
  if (!aircraft) return { game, error: "Aircraft record could not be found." };
  if (game.fleetTasks.some((task) => task.aircraftId === aircraftId && task.status === "active")) return { game, error: "This aircraft already has work in progress." };

  if (action === "advance-induction" || action === "configure-cabin") {
    const current = aircraft.inductionStage ?? "not-started";
    const stage = action === "configure-cabin" ? "cabin" : nextStage(current);
    if (!stage) return { game, error: "Aircraft induction is already complete." };
    if (stage === "cabin" && action !== "configure-cabin") return { game, error: "Select a cabin configuration before continuing." };
    const preset = action === "configure-cabin" ? option as CabinPreset : aircraft.cabinPreset;
    if (stage === "cabin" && !preset) return { game, error: "Select a cabin configuration." };
    const step = inductionSteps[stage];
    if (game.cash < step.cost) return { game, error: "The airline cannot fund this induction stage." };
    const task: FleetTask = { id: id("fleet-task"), aircraftId, kind: "induction", label: step.label, provider: `${game.hub.name} Induction Centre`, startedAt: game.gameDateTime, completesAt: new Date(Date.parse(game.gameDateTime) + step.days * DAY_MS).toISOString(), cost: step.cost, status: "active", targetStage: stage };
    return { error: null, game: { ...game, cash: game.cash - step.cost, fleetTasks: [...game.fleetTasks, task], fleet: game.fleet.map((item) => item.id === aircraftId ? { ...item, status: "induction", cabinPreset: preset ?? item.cabinPreset } : item), inbox: [mail(game, aircraft, `Induction commenced: ${aircraft.registration}`, `${step.label} has commenced at ${game.hub.name}. Completion is scheduled for ${new Date(task.completesAt).toLocaleString("en-ZA", { timeZone: "UTC" })}.`), ...game.inbox] } };
  }

  const maintenance = action === "line-maintenance" ? { label: "Routine line maintenance", days: 1, cost: 280_000, recovery: 3 } : action === "a-check" ? { label: "Scheduled A-check", days: 2, cost: 1_450_000, recovery: 9 } : { label: "Heavy C-check", days: 14, cost: 8_900_000, recovery: 25 };
  if (game.cash < maintenance.cost) return { game, error: "The airline cannot fund this maintenance package." };
  const task: FleetTask = { id: id("fleet-task"), aircraftId, kind: "maintenance", label: maintenance.label, provider: option || "Airline Technical Services", startedAt: game.gameDateTime, completesAt: new Date(Date.parse(game.gameDateTime) + maintenance.days * DAY_MS).toISOString(), cost: maintenance.cost, status: "active" };
  return { error: null, game: { ...game, cash: game.cash - maintenance.cost, fleetTasks: [...game.fleetTasks, task], fleet: game.fleet.map((item) => item.id === aircraftId ? { ...item, status: "maintenance" } : item), inbox: [mail(game, aircraft, `Maintenance input opened: ${aircraft.registration}`, `${maintenance.label} has commenced with ${task.provider}. The aircraft is unavailable until ${new Date(task.completesAt).toLocaleString("en-ZA", { timeZone: "UTC" })}.`), ...game.inbox] } };
}

export function processFleetTasks(game: AirlineState, targetTime: string) {
  const now = Date.parse(targetTime);
  let fleet = game.fleet;
  let inbox = game.inbox;
  const tasks = game.fleetTasks.map((task) => {
    if (task.status !== "active" || Date.parse(task.completesAt) > now) return task;
    const aircraft = fleet.find((item) => item.id === task.aircraftId);
    if (!aircraft) return { ...task, status: "completed" as const };
    if (task.kind === "induction" && task.targetStage) {
      const isComplete = task.targetStage === "base";
      const preset = aircraft.cabinPreset ?? "standard";
      const mix = cabinMix[preset];
      const capacity = Math.max(1, Math.round(aircraft.aircraft.seats * mix.multiplier));
      const business = Math.round(capacity * mix.business);
      const premiumEconomy = Math.round(capacity * mix.premiumEconomy);
      const first = Math.round(capacity * mix.first);
      const economy = capacity - business - premiumEconomy - first;
      fleet = fleet.map((item) => item.id === aircraft.id ? { ...item, inductionStage: isComplete ? "complete" : task.targetStage, status: isComplete ? "parked" : "induction", locallyRegistered: task.targetStage === "registration" || item.locallyRegistered, insured: task.targetStage === "registration" || item.insured, baseCode: isComplete ? game.hub.code : item.baseCode, currentLocation: isComplete ? game.hub.code : item.currentLocation, cabinClasses: task.targetStage === "cabin" ? { economy, premiumEconomy, business, first } : item.cabinClasses, nextMaintenanceAt: isComplete ? new Date(now + 90 * DAY_MS).toISOString() : item.nextMaintenanceAt } : item);
      inbox = [mail({ ...game, gameDateTime: targetTime }, aircraft, `${isComplete ? "Aircraft operationally released" : "Induction stage completed"}: ${aircraft.registration}`, isComplete ? `${aircraft.registration} has completed induction, is based at ${game.hub.code}, and is available for route assignment.` : `${task.label} has been completed. The aircraft may proceed to the next induction stage.`), ...inbox];
    } else {
      const recovery = task.label.includes("C-check") ? 25 : task.label.includes("A-check") ? 9 : 3;
      fleet = fleet.map((item) => item.id === aircraft.id ? { ...item, condition: Math.min(100, item.condition + recovery), status: "parked", nextMaintenanceAt: new Date(now + (task.label.includes("C-check") ? 365 : 90) * DAY_MS).toISOString() } : item);
      inbox = [mail({ ...game, gameDateTime: targetTime }, aircraft, `Maintenance completed: ${aircraft.registration}`, `${task.label} has been completed by ${task.provider}. The aircraft has returned to serviceable condition.`), ...inbox];
    }
    return { ...task, status: "completed" as const };
  });
  return { ...game, fleet, inbox, fleetTasks: tasks };
}
