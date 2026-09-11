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
  assert.equal(career.route, null);
  assert.equal(career.cash, career.strategy.capital);
  assert.equal(career.passengers, 0);
  assert.equal(career.lastProfit, 0);
  assert.ok(career.careerId);
  assert.ok(career.createdAt);
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
  assert.equal(migrated.route, null);
  assert.ok(migrated.careerId);
});
