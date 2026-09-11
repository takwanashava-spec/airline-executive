import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(
  new URL("..", import.meta.url),
);

const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function createTestCareer() {
  const { hubs, strategies } =
    await vite.ssrLoadModule("/lib/game-data.ts");

  const { createInitialCareer } =
    await vite.ssrLoadModule(
      "/lib/game/create-career.ts",
    );

  return createInitialCareer({
    airlineName: "Test Air",
    ceoName: "Alex Morgan",
    ceoNationality: "South African",
    ceoAge: 38,
    ceoBackground: "Network planning",
    iata: "TA",
    icao: "TST",
    hub: hubs[0],
    strategy: strategies[1],
  });
}

test("registration creates a versioned career with a game clock", async () => {
  const career = await createTestCareer();

  const { CURRENT_SAVE_VERSION } =
    await vite.ssrLoadModule("/types/game.ts");

  assert.equal(
    career.saveVersion,
    CURRENT_SAVE_VERSION,
  );
  assert.equal(career.week, 1);
  assert.equal(
    career.gameDateTime,
    "2026-09-06T08:00:00.000Z",
  );
  assert.equal(career.ceoName, "Alex Morgan");
  assert.equal(career.aircraft, null);
  assert.deepEqual(career.fleet, []);
  assert.deepEqual(career.inbox, []);
  assert.deepEqual(career.auctionBids, []);
  assert.deepEqual(career.leaseApplications, []);
  assert.deepEqual(career.usedAircraftTransactions, []);
  assert.deepEqual(career.inspectedUsedAircraft, []);
  assert.deepEqual(career.usedAircraftWatchlist, []);
  assert.deepEqual(career.fleetTasks, []);
  assert.deepEqual(career.routePlans, []);
  assert.deepEqual(career.slotApplications, []);
  assert.equal(career.route, null);
  assert.equal(career.cash, career.strategy.capital);
  assert.equal(career.passengers, 0);
  assert.equal(career.lastProfit, 0);
  assert.ok(career.careerId);
  assert.ok(career.createdAt);
});

test("route plans receive a slot decision and launch through the inbox", async () => {
  const career = await createTestCareer();
  const { purchaseAircraft } = await vite.ssrLoadModule("/lib/game/fleet.ts");
  const { processSlotApplications, respondToSlotMessage, setRouteSuspended, submitSlotApplication, validateRouteSchedule } = await vite.ssrLoadModule("/lib/game/routes.ts");
  const purchased = purchaseAircraft(career, "ATR 72-600").game;
  const ready = {
    ...purchased,
    fleet: purchased.fleet.map((item) => ({ ...item, status: "parked", inductionStage: "complete", baseCode: career.hub.code })),
  };
  const destination = {
    ...career.hub,
    code: "CPT",
    icao: "FACT",
    city: "Cape Town",
    name: "Cape Town International",
    latitude: -33.97,
    longitude: 18.6,
    slotPressure: "Medium",
    availableSlotsPercent: 28,
    passengerDemand: 84,
    coordinates: { x: 54, y: 77 },
  };
  const schedule = { destination, aircraftId: ready.fleet[0].id, weeklyFlights: 7, baseFare: 1850, departureTime: "08:00", returnDepartureTime: "12:30", turnaroundMinutes: 45, operatingDays: [0, 1, 2, 3, 4, 5, 6] };
  const submitted = submitSlotApplication(ready, schedule);
  assert.equal(submitted.error, null);
  assert.equal(submitted.game.routePlans[0].status, "slots-pending");
  const decided = processSlotApplications(submitted.game, submitted.game.slotApplications[0].decisionAt);
  assert.equal(decided.slotApplications[0].status, "approved");
  assert.match(decided.inbox[0].subject, /rotation approved/i);
  const launched = respondToSlotMessage(decided, decided.inbox[0].id, "accept");
  assert.equal(launched.error, null);
  assert.equal(launched.game.routePlans[0].status, "active");
  assert.equal(launched.game.fleet[0].status, "active");
  assert.equal(launched.game.route.to, "CPT");
  assert.equal(launched.game.routePlans[0].outboundFlightNumber, `${career.iata}101`);
  assert.equal(launched.game.routePlans[0].returnFlightNumber, `${career.iata}102`);
  assert.ok(validateRouteSchedule(launched.game, { ...schedule, weeklyFlights: 1, operatingDays: [0] }).some((issue) => issue.field === "conflict"));
  const suspended = setRouteSuspended(launched.game, launched.game.routePlans[0].id, true);
  assert.equal(suspended.error, null);
  assert.equal(suspended.game.routePlans[0].status, "suspended");
  assert.equal(suspended.game.fleet[0].status, "parked");
  const restored = setRouteSuspended(suspended.game, suspended.game.routePlans[0].id, false);
  assert.equal(restored.error, null);
  assert.equal(restored.game.routePlans[0].status, "active");
});

test("fleet induction and maintenance progress on the game clock", async () => {
  const career = await createTestCareer();
  const { purchaseAircraft } = await vite.ssrLoadModule("/lib/game/fleet.ts");
  const { performFleetAction, processFleetTasks } = await vite.ssrLoadModule("/lib/game/fleet-operations.ts");
  const purchased = purchaseAircraft(career, "ATR 72-600").game;
  const aircraftId = purchased.fleet[0].id;
  const started = performFleetAction(purchased, aircraftId, "advance-induction");
  assert.equal(started.error, null);
  assert.equal(started.game.fleet[0].status, "induction");
  const completed = processFleetTasks(started.game, started.game.fleetTasks[0].completesAt);
  assert.equal(completed.fleet[0].inductionStage, "technical");
  assert.equal(completed.fleetTasks[0].status, "completed");
  assert.match(completed.inbox[0].subject, /completed/i);
});

test("used aircraft inspections, offers and deliveries use the game clock", async () => {
  const career = await createTestCareer();
  const { buyUsedAircraftNow, processUsedAircraftTransactions, requestUsedAircraftInspection, submitUsedAircraftOffer, usedAircraftListings } = await vite.ssrLoadModule("/lib/game/used-aircraft.ts");
  const listing = usedAircraftListings[0];
  const inspected = requestUsedAircraftInspection(career, listing.id, "records");
  assert.equal(inspected.error, null);
  const report = processUsedAircraftTransactions(inspected.game, inspected.game.usedAircraftTransactions[0].decisionAt);
  assert.ok(report.inspectedUsedAircraft.includes(listing.id));
  assert.match(report.inbox[0].subject, /Inspection report/);

  const offered = submitUsedAircraftOffer(career, listing.id, listing.askingPrice);
  const decision = processUsedAircraftTransactions(offered.game, offered.game.usedAircraftTransactions[0].decisionAt);
  assert.equal(decision.usedAircraftTransactions[0].status, "accepted");

  const purchased = buyUsedAircraftNow(career, listing.id);
  assert.equal(purchased.error, null);
  assert.equal(purchased.game.fleet[0].status, "delivery");
  const delivered = processUsedAircraftTransactions(purchased.game, purchased.game.usedAircraftTransactions[0].deliveryAt);
  assert.equal(delivered.game ?? undefined, undefined);
  assert.equal(delivered.fleet[0].status, "parked");
  assert.equal(delivered.usedAircraftTransactions[0].status, "completed");
});

test("lease applications receive an inbox decision after one game day", async () => {
  const career = await createTestCareer();
  const { leaseOffers, processLeaseDecisions, submitLeaseApplication } = await vite.ssrLoadModule("/lib/game/leasing.ts");
  const submitted = submitLeaseApplication(career, leaseOffers[0].id);

  assert.equal(submitted.error, null);
  assert.equal(submitted.game.leaseApplications[0].status, "pending");
  assert.match(submitted.game.inbox[0].subject, /Lease application received/);

  const resolved = processLeaseDecisions(submitted.game, submitted.game.leaseApplications[0].decisionAt);
  assert.notEqual(resolved.leaseApplications[0].status, "pending");
  assert.equal(resolved.inbox[0].status, "unread");
});

test("auction bids resolve through the executive inbox after one game day", async () => {
  const career = await createTestCareer();
  const { auctionListings, processAuctionDecisions, submitAuctionBid } = await vite.ssrLoadModule("/lib/game/auctions.ts");
  const listing = auctionListings[0];
  const submitted = submitAuctionBid(career, listing.id, listing.reservePrice);

  assert.equal(submitted.error, null);
  assert.equal(submitted.game.auctionBids[0].status, "pending");
  assert.equal(submitted.game.inbox[0].status, "unread");

  const resolved = processAuctionDecisions(submitted.game, submitted.game.auctionBids[0].decisionAt);
  assert.equal(resolved.auctionBids[0].status, "accepted");
  assert.match(resolved.inbox[0].subject, /Bid accepted/);
  assert.equal(resolved.inbox[0].actions[0].id, "accept");
});

test("new aircraft market exposes complete manufacturer catalogues", async () => {
  const {
    aircraft,
    aircraftManufacturers,
  } = await vite.ssrLoadModule(
    "/lib/game-data.ts",
  );
  const { aircraftMarketOffers } =
    await vite.ssrLoadModule(
      "/lib/game/fleet.ts",
    );
  const expectedModels = {
    atr: 2,
    embraer: 3,
    airbus: 10,
    boeing: 9,
  };

  assert.equal(
    aircraftManufacturers.length,
    4,
  );
  assert.equal(aircraft.length, 24);

  for (const manufacturer of aircraftManufacturers) {
    assert.equal(
      aircraft.filter(
        (item) =>
          item.manufacturerId ===
          manufacturer.id,
      ).length,
      expectedModels[manufacturer.id],
    );
    assert.ok(manufacturer.fullName);
  }

  assert.equal(
    aircraftMarketOffers.filter(
      (offer) => offer.market === "new",
    ).length,
    aircraft.length,
  );
});

test("development aircraft are listed but cannot be delivered", async () => {
  const career = await createTestCareer();
  const {
    acquireAircraft,
    aircraftMarketOffers,
  } = await vite.ssrLoadModule(
    "/lib/game/fleet.ts",
  );
  const programme =
    aircraftMarketOffers.find(
      (offer) =>
        offer.market === "new" &&
        offer.aircraft.availability ===
          "development",
    );

  assert.ok(programme);

  const result = acquireAircraft(
    career,
    programme.id,
    "finance",
  );

  assert.ok(result.error);
  assert.equal(result.aircraft, null);
  assert.equal(result.game, career);
});

test("purchasing an aircraft deducts cash and adds it to the fleet", async () => {
  const career = await createTestCareer();
  const {
    aircraftPurchasePrices,
  } = await vite.ssrLoadModule(
    "/lib/game-data.ts",
  );
  const { purchaseAircraft } =
    await vite.ssrLoadModule(
      "/lib/game/fleet.ts",
    );

  const result = purchaseAircraft(
    career,
    "ATR 72-600",
  );

  assert.equal(result.error, null);
  assert.ok(result.aircraft);
  assert.equal(
    result.game.cash,
    career.cash -
      aircraftPurchasePrices["ATR 72-600"],
  );
  assert.equal(result.game.fleet.length, 1);
  assert.equal(
    result.game.fleet[0].registration,
    "ZS-001",
  );
  assert.equal(
    result.game.aircraft.model,
    "ATR 72-600",
  );
  assert.equal(
    result.game.fleet[0].status,
    "parked",
  );
  assert.equal(career.fleet.length, 0);
});

test("financing a new aircraft records the deposit and monthly commitment", async () => {
  const career = await createTestCareer();
  const {
    acquireAircraft,
    aircraftMarketOffers,
  } = await vite.ssrLoadModule(
    "/lib/game/fleet.ts",
  );
  const offer = aircraftMarketOffers.find(
    (item) =>
      item.market === "new" &&
      item.aircraft.model ===
        "Embraer E195-E2",
  );

  assert.ok(offer);

  const result = acquireAircraft(
    career,
    offer.id,
    "finance",
  );

  assert.equal(result.error, null);
  assert.ok(result.aircraft);
  assert.equal(
    result.game.cash,
    career.cash - offer.financeDeposit,
  );
  assert.equal(
    result.aircraft.acquisitionType,
    "financed",
  );
  assert.equal(
    result.aircraft.monthlyPayment,
    offer.financeMonthlyPayment,
  );
  assert.equal(
    result.aircraft.outstandingBalance,
    offer.cashPrice - offer.financeDeposit,
  );
  assert.equal(result.aircraft.market, "new");
});

test("leasing from a lessor records the deposit and contract", async () => {
  const career = await createTestCareer();
  const {
    acquireAircraft,
    aircraftMarketOffers,
  } = await vite.ssrLoadModule(
    "/lib/game/fleet.ts",
  );
  const offer = aircraftMarketOffers.find(
    (item) =>
      item.market === "lessor" &&
      item.aircraft.model ===
        "ATR 72-600",
  );

  assert.ok(offer);

  const result = acquireAircraft(
    career,
    offer.id,
    "lease",
  );

  assert.equal(result.error, null);
  assert.ok(result.aircraft);
  assert.equal(
    result.game.cash,
    career.cash - offer.monthlyLease * 3,
  );
  assert.equal(
    result.aircraft.acquisitionType,
    "leased",
  );
  assert.equal(
    result.aircraft.monthlyPayment,
    offer.monthlyLease,
  );
  assert.equal(
    result.aircraft.provider,
    offer.provider,
  );
  assert.equal(result.aircraft.market, "lessor");
});

test("an unaffordable aircraft purchase leaves the career unchanged", async () => {
  const career = await createTestCareer();
  const { purchaseAircraft } =
    await vite.ssrLoadModule(
      "/lib/game/fleet.ts",
    );

  const lowCashCareer = {
    ...career,
    cash: 1_000_000,
  };
  const result = purchaseAircraft(
    lowCashCareer,
    "Airbus A220-300",
  );

  assert.ok(result.error);
  assert.equal(result.aircraft, null);
  assert.equal(result.game, lowCashCareer);
  assert.equal(result.game.fleet.length, 0);
});

test("game clock advances continuously and closes weeks automatically", async () => {
  const career = await createTestCareer();

  const { advanceCareerClock } =
    await vite.ssrLoadModule(
      "/lib/game/simulation.ts",
    );

  const oneHourLater = advanceCareerClock(
    career,
    60,
  );

  assert.equal(
    Date.parse(oneHourLater.gameDateTime) -
      Date.parse(career.gameDateTime),
    60 * 60 * 1_000,
  );
  assert.equal(oneHourLater.week, 1);

  const oneWeekLater = advanceCareerClock(
    career,
    7 * 24 * 60,
  );

  assert.equal(oneWeekLater.week, 2);
  assert.equal(oneWeekLater.passengers, 0);
  assert.equal(oneWeekLater.lastProfit, 0);
});

test("weekly calendar advances safely before operations exist", async () => {
  const career = await createTestCareer();

  const { advanceCareerWeek } =
    await vite.ssrLoadModule(
      "/lib/game/simulation.ts",
    );

  const result = advanceCareerWeek(career);

  assert.equal(career.week, 1);
  assert.equal(result.week, 2);
  assert.equal(result.game.week, 2);
  assert.equal(result.passengers, 0);
  assert.equal(result.profit, 0);
});

test("an existing operational career still advances without mutation", async () => {
  const career = await createTestCareer();
  const { aircraft, routeSeeds } =
    await vite.ssrLoadModule("/lib/game-data.ts");
  const { advanceCareerWeek } =
    await vite.ssrLoadModule(
      "/lib/game/simulation.ts",
    );

  const operationalCareer = {
    ...career,
    aircraft: aircraft[1],
    route: routeSeeds.JNB[0],
    loadFactor: 64,
    onTime: 91.4,
    aircraftCondition: 100,
  };

  const result = advanceCareerWeek(
    operationalCareer,
  );

  assert.equal(operationalCareer.week, 1);
  assert.equal(result.week, 2);
  assert.equal(result.game.week, 2);
  assert.equal(
    result.game.cash,
    operationalCareer.cash + result.profit,
  );
  assert.equal(
    result.game.passengers,
    result.passengers,
  );
});

test("migrates an older career with safe clock and profile fallbacks", async () => {
  const career = await createTestCareer();

  const {
    careerId,
    createdAt,
    updatedAt,
    saveVersion,
    gameDateTime,
    fleet,
    ceoName,
    ceoNationality,
    ceoAge,
    ceoBackground,
    ...legacyCareer
  } = career;

  assert.ok(careerId);
  assert.ok(createdAt);
  assert.ok(updatedAt);
  assert.ok(saveVersion);
  assert.ok(gameDateTime);
  assert.deepEqual(fleet, []);
  assert.ok(ceoName);
  assert.ok(ceoNationality);
  assert.ok(ceoAge);
  assert.ok(ceoBackground);

  const { migrateCareer } =
    await vite.ssrLoadModule(
      "/lib/game/persistence.ts",
    );

  const migrated = migrateCareer(legacyCareer);

  assert.ok(migrated);
  assert.equal(migrated.ceoName, "Chief Executive");
  assert.equal(
    migrated.ceoNationality,
    "Not specified",
  );
  assert.equal(migrated.ceoAge, 35);
  assert.equal(
    migrated.ceoBackground,
    "Airline founder",
  );
  assert.equal(
    migrated.gameDateTime,
    "2026-09-06T08:00:00.000Z",
  );
  assert.equal(migrated.aircraft, null);
  assert.deepEqual(migrated.fleet, []);
  assert.equal(migrated.route, null);
  assert.ok(migrated.careerId);
});
