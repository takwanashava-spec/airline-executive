"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CloudSun,
  Fuel,
  Gauge,
  Globe2,
  LayoutDashboard,
  Menu,
  Plane,
  PlaneTakeoff,
  Play,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Brand } from "@/components/brand";
import { FounderSetup } from "@/components/founder/founder-setup";
import { OpeningMenu } from "@/components/game/opening-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  formatMoney,
  routeSeeds,
} from "@/lib/game-data";
import {
  loadCareer,
  saveCareer,
} from "@/lib/game/persistence";
import { advanceCareerWeek } from "@/lib/game/simulation";
import type {
  AirlineState,
  View,
} from "@/types/game";

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const navItems = [
  {
    id: "overview" as View,
    label: "Command centre",
    icon: LayoutDashboard,
  },
  {
    id: "network" as View,
    label: "Network",
    icon: Route,
  },
  {
    id: "fleet" as View,
    label: "Fleet",
    icon: Plane,
  },
  {
    id: "finance" as View,
    label: "Finance",
    icon: BarChart3,
  },
];

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof Activity;
  tone?: string;
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-head">
        <span>{label}</span>
        <Icon />
      </div>

      <strong>{value}</strong>
      <small>{change}</small>
    </article>
  );
}

function RouteMap({ game }: { game: AirlineState }) {
  return (
    <div
      className="network-map"
      aria-label={`Route map from ${game.hub.code} to ${game.route.to}`}
    >
      <div className="map-grid" />
      <div className="map-orbit orbit-one" />
      <div className="map-orbit orbit-two" />

      <div
        className="route-arc"
        style={{
          left: `${Math.min(
            game.hub.coordinates.x,
            game.route.coordinates.x,
          )}%`,
          top: `${Math.min(
            game.hub.coordinates.y,
            game.route.coordinates.y,
          )}%`,
          width: `${Math.max(
            12,
            Math.abs(
              game.hub.coordinates.x -
                game.route.coordinates.x,
            ),
          )}%`,
          height: `${Math.max(
            10,
            Math.abs(
              game.hub.coordinates.y -
                game.route.coordinates.y,
            ),
          )}%`,
        }}
      />

      <div
        className="map-node hub-node"
        style={{
          left: `${game.hub.coordinates.x}%`,
          top: `${game.hub.coordinates.y}%`,
        }}
      >
        <i />
        <span>{game.hub.code}</span>
      </div>

      <div
        className="map-node destination-node"
        style={{
          left: `${game.route.coordinates.x}%`,
          top: `${game.route.coordinates.y}%`,
        }}
      >
        <i />
        <span>{game.route.to}</span>
      </div>

      <div
        className="map-flight"
        style={{
          left: `${
            (game.hub.coordinates.x +
              game.route.coordinates.x) /
            2
          }%`,
          top: `${
            (game.hub.coordinates.y +
              game.route.coordinates.y) /
              2 -
            4
          }%`,
        }}
      >
        <Plane />
      </div>

      <div className="map-label north-america">
        NORTH AMERICA
      </div>
      <div className="map-label europe">EUROPE</div>
      <div className="map-label africa">AFRICA</div>
      <div className="map-label asia">ASIA PACIFIC</div>

      <div className="weather-chip">
        <CloudSun />
        <span>Hub weather</span>
        <b>22°C</b>
      </div>
    </div>
  );
}

function Overview({ game }: { game: AirlineState }) {
  return (
    <>
      <section className="metric-grid">
        <MetricCard
          label="Cash position"
          value={formatMoney(game.cash)}
          change={`${
            game.lastProfit >= 0 ? "+" : ""
          }${formatMoney(game.lastProfit)} this week`}
          icon={WalletCards}
          tone={
            game.lastProfit >= 0
              ? "positive"
              : "warning"
          }
        />

        <MetricCard
          label="Weekly passengers"
          value={game.passengers.toLocaleString()}
          change={`${game.loadFactor}% network load factor`}
          icon={Users}
        />

        <MetricCard
          label="On-time performance"
          value={`${game.onTime.toFixed(1)}%`}
          change="Target · 90.0%"
          icon={Clock3}
          tone={
            game.onTime >= 90
              ? "positive"
              : "warning"
          }
        />

        <MetricCard
          label="Airline reputation"
          value={`${game.reputation}/100`}
          change={
            game.reputation >= 55
              ? "Trusted regional operator"
              : "Building market awareness"
          }
          icon={Sparkles}
        />
      </section>

      <section className="command-grid">
        <article className="panel network-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                LIVE NETWORK
              </span>
              <h2>{game.hub.code} operations</h2>
            </div>

            <div className="live-pill">
              <i />
              LIVE
            </div>
          </div>

          <RouteMap game={game} />

          <div className="route-live-row">
            <div className="route-flight-no">
              <span>{game.iata} 101</span>

              <strong>
                {game.hub.code} <ArrowRight />{" "}
                {game.route.to}
              </strong>
            </div>

            <div>
              <small>NEXT DEPARTURE</small>
              <strong>14:35</strong>
            </div>

            <div>
              <small>AIRCRAFT</small>
              <strong>{game.aircraft.model}</strong>
            </div>

            <div>
              <small>LOAD</small>
              <strong>{game.loadFactor}%</strong>
            </div>

            <span className="status-on-time">
              ON TIME
            </span>
          </div>
        </article>

        <article className="panel brief-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                EXECUTIVE BRIEF
              </span>
              <h2>What needs attention</h2>
            </div>

            <span className="brief-count">3</span>
          </div>

          <div className="brief-list">
            <button>
              <span className="brief-icon fuel">
                <Fuel />
              </span>

              <div>
                <strong>Fuel market firming</strong>

                <p>
                  Jet fuel index is{" "}
                  {game.fuelIndex.toFixed(1)}, increasing
                  sector cost pressure.
                </p>
              </div>

              <ChevronRight />
            </button>

            <button>
              <span className="brief-icon blue">
                <TrendingUp />
              </span>

              <div>
                <strong>
                  {game.route.to} demand is strengthening
                </strong>

                <p>
                  Forward bookings are tracking 6% above the
                  opening forecast.
                </p>
              </div>

              <ChevronRight />
            </button>

            <button>
              <span className="brief-icon green">
                <ShieldCheck />
              </span>

              <div>
                <strong>
                  Operations remain stable
                </strong>

                <p>
                  {game.aircraft.model} dispatch reliability is{" "}
                  {game.aircraft.reliability}%.
                </p>
              </div>

              <ChevronRight />
            </button>
          </div>

          <div className="board-objective">
            <span>BOARD OBJECTIVE · Q1</span>

            <div>
              <strong>
                Reach 68% average load factor
              </strong>
              <b>{game.loadFactor}%</b>
            </div>

            <Progress
              value={Math.min(
                100,
                game.loadFactor / 0.68,
              )}
            />

            <small>
              Reward: R12m growth facility
            </small>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading compact">
            <div>
              <span className="panel-eyebrow">
                ROUTE PERFORMANCE
              </span>
              <h2>Current schedule</h2>
            </div>
          </div>

          <div className="route-table">
            <div className="table-head">
              <span>ROUTE</span>
              <span>FREQUENCY</span>
              <span>LOAD FACTOR</span>
              <span>WEEKLY RESULT</span>
              <span>STATUS</span>
            </div>

            <div className="table-row">
              <div>
                <b>{game.hub.code}</b>
                <ArrowRight />
                <b>{game.route.to}</b>

                <small>
                  {game.route.distance.toLocaleString()} km ·{" "}
                  {game.route.blockTime}
                </small>
              </div>

              <span>
                {game.route.weeklyFlights}× weekly
              </span>

              <span>
                <i
                  style={{
                    width: `${game.loadFactor}%`,
                  }}
                />

                <b>{game.loadFactor}%</b>
              </span>

              <strong
                className={
                  game.lastProfit >= 0
                    ? "profit"
                    : "loss"
                }
              >
                {formatMoney(game.lastProfit)}
              </strong>

              <em>Operating</em>
            </div>
          </div>
        </article>

        <article className="panel fleet-mini">
          <div className="panel-heading compact">
            <div>
              <span className="panel-eyebrow">
                FLEET HEALTH
              </span>
              <h2>Aircraft status</h2>
            </div>

            <span className="fleet-count">
              1 aircraft
            </span>
          </div>

          <div className="fleet-visual">
            <Plane />

            <div>
              <span>{game.icao}-001</span>
              <strong>{game.aircraft.model}</strong>

              <small>
                At {game.hub.code} · Next sector in 2h 18m
              </small>
            </div>
          </div>

          <div className="fleet-stats">
            <div>
              <span>CONDITION</span>

              <strong>
                {game.aircraftCondition.toFixed(1)}%
              </strong>

              <Progress
                value={game.aircraftCondition}
              />
            </div>

            <div>
              <span>UTILISATION</span>
              <strong>8.7h</strong>
              <Progress value={73} />
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function NetworkView({
  game,
}: {
  game: AirlineState;
}) {
  const marketRoutes =
    routeSeeds[game.hub.code] ?? [game.route];

  return (
    <section className="module-grid">
      <article className="panel module-hero">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              NETWORK PLANNING
            </span>

            <h2>{game.hub.city} hub strategy</h2>
          </div>

          <span className="status-on-time">
            1 ACTIVE ROUTE
          </span>
        </div>

        <RouteMap game={game} />
      </article>

      <article className="panel market-list">
        <div className="panel-heading compact">
          <div>
            <span className="panel-eyebrow">
              MARKET SCREEN
            </span>

            <h2>Expansion candidates</h2>
          </div>
        </div>

        {marketRoutes.map((route) => (
          <div
            className={`market-row ${
              route.to === game.route.to
                ? "active"
                : ""
            }`}
            key={route.to}
          >
            <span className="airport-pair">
              {route.from}
              <ArrowRight />
              {route.to}
            </span>

            <div>
              <strong>{route.city}</strong>

              <small>
                {route.distance.toLocaleString()} km ·{" "}
                {route.blockTime}
              </small>
            </div>

            <div className="market-score">
              <span>DEMAND</span>
              <b>{route.demand}</b>
            </div>

            <Button
              variant={
                route.to === game.route.to
                  ? "secondary"
                  : "outline"
              }
              size="sm"
              disabled
            >
              {route.to === game.route.to
                ? "Operating"
                : "Research"}
            </Button>
          </div>
        ))}
      </article>
    </section>
  );
}

function FleetView({
  game,
}: {
  game: AirlineState;
}) {
  return (
    <section className="module-grid">
      <article className="panel aircraft-detail">
        <div className="aircraft-banner">
          <div className="plane-large">
            <Plane />
          </div>

          <div>
            <span className="panel-eyebrow">
              {game.icao}-001 · ACTIVE
            </span>

            <h2>{game.aircraft.model}</h2>

            <p>
              {game.aircraft.family} ·{" "}
              {game.aircraft.seats} seats · Delivered Aug
              2026
            </p>
          </div>
        </div>

        <div className="spec-grid">
          <div>
            <span>RANGE</span>

            <strong>
              {game.aircraft.range.toLocaleString()} km
            </strong>
          </div>

          <div>
            <span>CRUISE SPEED</span>

            <strong>
              {game.aircraft.cruiseSpeed.toLocaleString()}{" "}
              km/h
            </strong>
          </div>

          <div>
            <span>TURNAROUND</span>
            <strong>
              {game.aircraft.turnaround} min
            </strong>
          </div>

          <div>
            <span>RELIABILITY</span>
            <strong>
              {game.aircraft.reliability}%
            </strong>
          </div>

          <div>
            <span>LEASE / MONTH</span>
            <strong>
              {formatMoney(
                game.aircraft.monthlyLease,
              )}
            </strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading compact">
          <div>
            <span className="panel-eyebrow">
              ENGINEERING
            </span>
            <h2>Technical condition</h2>
          </div>

          <span className="status-on-time">
            SERVICEABLE
          </span>
        </div>

        <div className="health-ring">
          <div
            style={
              {
                "--health": `${
                  game.aircraftCondition * 3.6
                }deg`,
              } as React.CSSProperties
            }
          >
            <span>
              {game.aircraftCondition.toFixed(1)}%
            </span>
            <small>AIRFRAME</small>
          </div>
        </div>

        <div className="maintenance-list">
          <div>
            <span>
              <Gauge />
              A-check forecast
            </span>

            <strong>184 flight hours</strong>
          </div>

          <div>
            <span>
              <ShieldCheck />
              Open defects
            </span>

            <strong>0 MEL items</strong>
          </div>

          <div>
            <span>
              <CalendarDays />
              Next inspection
            </span>

            <strong>28 Sep 2026</strong>
          </div>
        </div>
      </article>
    </section>
  );
}

function FinanceView({
  game,
}: {
  game: AirlineState;
}) {
  const lines = [
    {
      label: "Passenger revenue",
      value: game.lastRevenue,
      type: "income",
    },
    {
      label: "Fuel & emissions",
      value: -(game.lastCosts * 0.34),
      type: "cost",
    },
    {
      label: "Aircraft lease",
      value: -(game.aircraft.monthlyLease / 4.33),
      type: "cost",
    },
    {
      label: "Crew & operations",
      value: -(game.lastCosts * 0.27),
      type: "cost",
    },
    {
      label: "Airport & navigation",
      value: -(game.lastCosts * 0.21),
      type: "cost",
    },
  ];

  return (
    <section className="finance-layout">
      <div className="metric-grid finance-metrics">
        <MetricCard
          label="Weekly revenue"
          value={formatMoney(game.lastRevenue)}
          change={`${game.passengers.toLocaleString()} passengers carried`}
          icon={CircleDollarSign}
          tone="positive"
        />

        <MetricCard
          label="Operating costs"
          value={formatMoney(game.lastCosts)}
          change={`${Math.round(
            game.lastCosts /
              Math.max(1, game.passengers),
          )} per passenger`}
          icon={Building2}
        />

        <MetricCard
          label="Operating result"
          value={formatMoney(game.lastProfit)}
          change={`${(
            (game.lastProfit / game.lastRevenue) *
            100
          ).toFixed(1)}% margin`}
          icon={TrendingUp}
          tone={
            game.lastProfit >= 0
              ? "positive"
              : "warning"
          }
        />
      </div>

      <article className="panel pnl-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              MANAGEMENT ACCOUNTS
            </span>

            <h2>Weekly profit & loss</h2>
          </div>

          <span>Week {game.week}</span>
        </div>

        <div className="pnl-lines">
          {lines.map((line) => (
            <div key={line.label}>
              <span>{line.label}</span>

              <strong className={line.type}>
                {formatMoney(line.value)}
              </strong>
            </div>
          ))}

          <div className="pnl-total">
            <span>Operating profit</span>

            <strong>
              {formatMoney(game.lastProfit)}
            </strong>
          </div>
        </div>
      </article>
    </section>
  );
}

export default function AirlineGame() {
  const [game, setGame] =
    useState<AirlineState | null>(null);

  const [loaded, setLoaded] = useState(false);

  const [screen, setScreen] = useState<
    "opening" | "setup" | "game" | "exited"
  >("opening");

  const [view, setView] =
    useState<View>("overview");

  const [mobileNav, setMobileNav] =
    useState(false);

  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const savedGame = loadCareer(
      window.localStorage,
    );

    queueMicrotask(() => {
      setGame(savedGame);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (game && loaded) {
      saveCareer(window.localStorage, game);
    }
  }, [game, loaded]);

  const gameDate = useMemo(
    () =>
      game
        ? new Date(
            2026,
            8,
            6 + (game.week - 1) * 7,
          ).toLocaleDateString("en-ZA", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "",
    [game],
  );

  const advanceWeek = () => {
    if (!game) return;

    const result = advanceCareerWeek(game);

    setGame(result.game);

    toast(
      result.profit >= 0
        ? `Week ${result.week} closed with ${formatMoney(
            result.profit,
          )} operating profit`
        : `Week ${result.week} closed with a ${formatMoney(
            result.profit,
          )} loss`,
      {
        description: `${result.passengers.toLocaleString()} passengers · ${result.loadFactor}% load factor`,
      },
    );
  };

  if (!loaded) {
    return (
      <div className="loading-screen">
        <PlaneTakeoff />
        <span>Preparing operations</span>
      </div>
    );
  }

  if (screen === "opening") {
    return (
      <>
        <OpeningMenu
          game={game}
          onContinue={() =>
            game && setScreen("game")
          }
          onNewCareer={() =>
            setScreen("setup")
          }
          onExit={() =>
            setScreen("exited")
          }
        />

        <Toaster position="bottom-right" />
      </>
    );
  }

  if (screen === "exited") {
    return (
      <main
        className="exit-screen"
        style={
          {
            "--opening-background": `url('${PUBLIC_BASE_PATH}/opening-airport-dusk.png')`,
          } as React.CSSProperties
        }
      >
        <Brand />

        <div>
          <span>SESSION PAUSED</span>
          <h1>Thank you for playing.</h1>

          <p>
            Your progress is safe. You can close this tab or return to the main
            menu.
          </p>

          <Button
            className="gold-button"
            onClick={() =>
              setScreen("opening")
            }
          >
            Return to main menu
          </Button>
        </div>
      </main>
    );
  }

  if (screen === "setup") {
    return (
      <>
        <FounderSetup
          onBack={() =>
            setScreen("opening")
          }
          onLaunch={(state) => {
            setGame(state);
            setScreen("game");

            toast.success(
              `${state.airlineName} is cleared for launch`,
            );
          }}
        />

        <Toaster position="bottom-right" />
      </>
    );
  }

  if (!game) {
    return (
      <OpeningMenu
        game={null}
        onContinue={() => undefined}
        onNewCareer={() =>
          setScreen("setup")
        }
        onExit={() =>
          setScreen("exited")
        }
      />
    );
  }

  return (
    <div className="game-shell">
      <aside
        className={`game-sidebar ${
          mobileNav ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <Brand />

          <Button
            variant="ghost"
            size="icon"
            className="close-mobile"
            onClick={() =>
              setMobileNav(false)
            }
          >
            <X />
          </Button>
        </div>

        <div className="airline-identity">
          <span className="airline-monogram">
            {game.iata}
          </span>

          <div>
            <strong>{game.airlineName}</strong>

            <small>
              {game.iata} / {game.icao} ·{" "}
              {game.hub.code}
            </small>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                view === item.id ? "active" : ""
              }
              onClick={() => {
                setView(item.id);
                setMobileNav(false);
              }}
            >
              <item.icon />
              <span>{item.label}</span>
              {view === item.id && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-section">
          <span>OPERATIONS</span>

          <button disabled>
            <Users />
            <span>People</span>
            <em>SOON</em>
          </button>

          <button disabled>
            <Globe2 />
            <span>Market intelligence</span>
            <em>SOON</em>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="status-card">
            <div>
              <span>SIMULATION HEALTH</span>
              <i />
            </div>

            <strong>
              All systems normal
            </strong>

            <small>
              Autosaved moments ago
            </small>
          </div>

          <button>
            <Settings />
            <span>Game settings</span>
          </button>
        </div>
      </aside>

      {mobileNav && (
        <button
          type="button"
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() =>
            setMobileNav(false)
          }
        />
      )}

      <div className="game-main">
        <header className="topbar">
          <div className="topbar-title">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              onClick={() =>
                setMobileNav(true)
              }
            >
              <Menu />
            </Button>

            <div>
              <span>
                {
                  navItems.find(
                    (item) => item.id === view,
                  )?.label
                }
              </span>

              <strong>{game.airlineName}</strong>
            </div>
          </div>

          <div className="sim-controls">
            <div className="sim-date">
              <CalendarDays />
              <span>WEEK {game.week}</span>
              <strong>{gameDate}</strong>
            </div>

            <div className="speed-control">
              <button
                className={
                  speed === 0 ? "active" : ""
                }
                onClick={() => setSpeed(0)}
              >
                Ⅱ
              </button>

              {[1, 2, 4].map((item) => (
                <button
                  key={item}
                  className={
                    speed === item
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSpeed(item)
                  }
                >
                  {item}×
                </button>
              ))}
            </div>

            <Button
              className="advance-button"
              onClick={advanceWeek}
            >
              <Play />
              Advance 7 days
            </Button>
          </div>
        </header>

        <main className="dashboard">
          <div className="dashboard-header">
            <div>
              <span className="dashboard-kicker">
                FOUNDER CAREER · YEAR 1
              </span>

              <h1>
                {view === "overview"
                  ? "Good evening, Chief Executive."
                  : navItems.find(
                      (item) =>
                        item.id === view,
                    )?.label}
              </h1>

              <p>
                {view === "overview"
                  ? `Operations are stable at ${game.hub.name}. Here is your latest executive picture.`
                  : `Week ${game.week} · ${game.hub.code} headquarters`}
              </p>
            </div>

            <div className="market-ticker">
              <div>
                <Fuel />
                <span>JET FUEL</span>

                <strong>
                  {game.fuelIndex.toFixed(1)}
                </strong>

                <small
                  className={
                    game.fuelIndex > 105
                      ? "up"
                      : "down"
                  }
                >
                  {game.fuelIndex > 105
                    ? "▲"
                    : "▼"}{" "}
                  1.8%
                </small>
              </div>

              <div>
                <Zap />
                <span>USD / ZAR</span>
                <strong>17.68</strong>
                <small className="down">
                  ▼ 0.4%
                </small>
              </div>
            </div>
          </div>

          {view === "overview" && (
            <Overview game={game} />
          )}

          {view === "network" && (
            <NetworkView game={game} />
          )}

          {view === "fleet" && (
            <FleetView game={game} />
          )}

          {view === "finance" && (
            <FinanceView game={game} />
          )}
        </main>
      </div>

      <Toaster
        position="bottom-right"
        richColors
      />
    </div>
  );
}
