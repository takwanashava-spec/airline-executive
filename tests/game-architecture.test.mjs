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
  const { aircraft, hubs, routeSeeds, strategies } =
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
    aircraft: aircraft[1],
    route: routeSeeds.JNB[0],
  });
}

test("creates a versioned career and advances it without mutating the original", async () => {
  const career = await createTestCareer();

  const { CURRENT_SAVE_VERSION } =
    await vite.ssrLoadModule("/types/game.ts");

  const { advanceCareerWeek } =
    await vite.ssrLoadModule(
      "/lib/game/simulation.ts",
    );

  assert.equal(
    career.saveVersion,
    CURRENT_SAVE_VERSION,
  );
  assert.equal(career.week, 1);
  assert.equal(career.ceoName, "Alex Morgan");
  assert.ok(career.careerId);
  assert.ok(career.createdAt);

  const result = advanceCareerWeek(career);

  assert.equal(career.week, 1);
  assert.equal(result.week, 2);
  assert.equal(result.game.week, 2);
  assert.equal(
    result.game.cash,
    career.cash + result.profit,
  );
  assert.equal(
    result.game.passengers,
    result.passengers,
  );
});

test("migrates a pre-CEO career with safe profile fallbacks", async () => {
  const career = await createTestCareer();

  const {
    careerId,
    createdAt,
    updatedAt,
    saveVersion,
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
  assert.ok(migrated.careerId);
});
