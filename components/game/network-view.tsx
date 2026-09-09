"use client";

import { ArrowRight } from "lucide-react";

import { RouteMap } from "@/components/game/command-centre";
import { Button } from "@/components/ui/button";
import { routeSeeds } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function NetworkView({ game }: { game: AirlineState }) {
  const marketRoutes = routeSeeds[game.hub.code] ?? [game.route];

  return (
    <section className="module-grid">
      <article className="panel module-hero">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">NETWORK PLANNING</span>
            <h2>{game.hub.city} hub strategy</h2>
          </div>

          <span className="status-on-time">1 ACTIVE ROUTE</span>
        </div>

        <RouteMap game={game} />
      </article>

      <article className="panel market-list">
        <div className="panel-heading compact">
          <div>
            <span className="panel-eyebrow">MARKET SCREEN</span>
            <h2>Expansion candidates</h2>
          </div>
        </div>

        {marketRoutes.map((route) => (
          <div
            className={`market-row ${
              route.to === game.route.to ? "active" : ""
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
                {route.distance.toLocaleString()} km · {route.blockTime}
              </small>
            </div>

            <div className="market-score">
              <span>DEMAND</span>
              <b>{route.demand}</b>
            </div>

            <Button
              variant={
                route.to === game.route.to ? "secondary" : "outline"
              }
              size="sm"
              disabled
            >
              {route.to === game.route.to ? "Operating" : "Research"}
            </Button>
          </div>
        ))}
      </article>
    </section>
  );
}
