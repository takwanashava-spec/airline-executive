import vinext from "vinext";
import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const AIRPORT_DATA_MODULE_ID = "\0airport-data-js-prebuilt.airportdata";
const airportDataEntry = createRequire(import.meta.url).resolve("airport-data-js");

function airportDataPrebuiltPlugin() {
  return {
    name: "airline-executive:airport-data-prebuilt",
    enforce: "pre" as const,
    resolveId(id: string) {
      return id === "airport-data-js" ? AIRPORT_DATA_MODULE_ID : null;
    },
    load(id: string) {
      if (id !== AIRPORT_DATA_MODULE_ID) return null;

      const commonJsBundle = readFileSync(airportDataEntry, "utf8");
      const esmBundle = commonJsBundle
        .replace(/^\(\(\)=>\{/, "const airportData=(()=>{")
        .replace(/,module\.exports=i\}\)\(\);\s*$/, ";return i})();");

      if (esmBundle === commonJsBundle) {
        throw new Error("The airport catalogue bundle format has changed.");
      }

      return `${esmBundle}\nexport const { getAirportByIata, getAirportByIcao, getAutocompleteSuggestions, findNearbyAirports } = airportData;\nexport default airportData;`;
    },
  };
}

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local", ".app.github.dev"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      airportDataPrebuiltPlugin(),
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: localBindingConfig,
      }),
    ],
  };
});
