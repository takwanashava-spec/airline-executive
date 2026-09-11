"use client";

import { ArrowRight } from "lucide-react";

import { RouteMap } from "@/components/game/command-centre";
import { Button } from "@/components/ui/button";
import { routeSeeds } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function NetworkView({ game }: { game: AirlineState }) {
  const marketRoutes = routeSeeds[game.hub.code] ?? [];
  const activeRoute = game.route;

  return (
    <section className="module-grid">
      <article className="panel module-hero">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">NETWORK PLANNING</span>
            <h2>{game.hub.city} hub strategy</h2>
          </div>

          <span className="status-on-time">
            {activeRoute ? "1 ACTIVE ROUTE" : "0 ACTIVE ROUTES"}
          </span>
        </div>

        <RouteMap game={game} />
      </article>

      <article className="panel market-list">
        <div className="panel-heading compact">
          <div>
            <span className="panel-eyebrow">MARKET SCREEN</span>
            <h2>
              {activeRoute ? "Expansion candidates" : "Future route research"}
            </h2>
          </div>
        </div>

        {marketRoutes.length > 0 ? (
          marketRoutes.map((route) => {
            const isActive = route.to === activeRoute?.to;

            return (
              <div
                className={`market-row ${isActive ? "active" : ""}`}
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
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  disabled
                >
                  {isActive ? "Operating" : "Research soon"}
                </Button>
              </div>
            );
          })
        ) : (
          <div className="route-researching">
            <strong>No markets researched yet</strong>
            <small>
              Route research will be unlocked as the gameplay foundation grows.
            </small>
          </div>
        )}
      </article>
    </section>
  );
}
