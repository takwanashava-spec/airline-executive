"use client";

import {
  Activity,
  ArrowRight,
  ChevronRight,
  Clock3,
  CloudSun,
  Fuel,
  Plane,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function MetricCard({
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

export function RouteMap({ game }: { game: AirlineState }) {
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

export function CommandCentre({ game }: { game: AirlineState }) {
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
          tone={game.lastProfit >= 0 ? "positive" : "warning"}
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
          tone={game.onTime >= 90 ? "positive" : "warning"}
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
              <span className="panel-eyebrow">LIVE NETWORK</span>
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
                {game.hub.code} <ArrowRight /> {game.route.to}
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

            <span className="status-on-time">ON TIME</span>
          </div>
        </article>

        <article className="panel brief-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">EXECUTIVE BRIEF</span>
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
                  Jet fuel index is {game.fuelIndex.toFixed(1)}, increasing
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
                <strong>{game.route.to} demand is strengthening</strong>
                <p>
                  Forward bookings are tracking 6% above the opening forecast.
                </p>
              </div>

              <ChevronRight />
            </button>

            <button>
              <span className="brief-icon green">
                <ShieldCheck />
              </span>

              <div>
                <strong>Operations remain stable</strong>
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
              <strong>Reach 68% average load factor</strong>
              <b>{game.loadFactor}%</b>
            </div>

            <Progress value={Math.min(100, game.loadFactor / 0.68)} />
            <small>Reward: R12m growth facility</small>
          </div>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-heading compact">
            <div>
              <span className="panel-eyebrow">ROUTE PERFORMANCE</span>
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

              <span>{game.route.weeklyFlights}× weekly</span>

              <span>
                <i style={{ width: `${game.loadFactor}%` }} />
                <b>{game.loadFactor}%</b>
              </span>

              <strong
                className={game.lastProfit >= 0 ? "profit" : "loss"}
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
              <span className="panel-eyebrow">FLEET HEALTH</span>
              <h2>Aircraft status</h2>
            </div>

            <span className="fleet-count">1 aircraft</span>
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
              <strong>{game.aircraftCondition.toFixed(1)}%</strong>
              <Progress value={game.aircraftCondition} />
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
