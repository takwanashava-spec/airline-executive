"use client";

import {
  CalendarDays,
  Gauge,
  Plane,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  aircraft,
  aircraftPurchasePrices,
  formatMoney,
} from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function FleetView({
  game,
  onPurchaseAircraft,
}: {
  game: AirlineState;
  onPurchaseAircraft: (
    model: string,
  ) => void;
}) {
  const primaryAircraft =
    game.fleet[0] ?? null;

  return (
    <section className="fleet-page">
      <div className="module-grid">
        <article className="panel aircraft-detail">
          {primaryAircraft ? (
            <>
              <div className="aircraft-banner">
                <div className="plane-large">
                  <Plane />
                </div>

                <div>
                  <span className="panel-eyebrow">
                    {primaryAircraft.registration} ·{" "}
                    {primaryAircraft.status.toUpperCase()}
                  </span>
                  <h2>
                    {primaryAircraft.aircraft.model}
                  </h2>
                  <p>
                    {primaryAircraft.aircraft.family} ·{" "}
                    {primaryAircraft.aircraft.seats} seats ·
                    Based at {game.hub.code}
                  </p>
                </div>
              </div>

              <div className="spec-grid">
                <div>
                  <span>RANGE</span>
                  <strong>
                    {primaryAircraft.aircraft.range.toLocaleString()}{" "}
                    km
                  </strong>
                </div>
                <div>
                  <span>CRUISE SPEED</span>
                  <strong>
                    {primaryAircraft.aircraft.cruiseSpeed.toLocaleString()}{" "}
                    km/h
                  </strong>
                </div>
                <div>
                  <span>CONDITION</span>
                  <strong>
                    {primaryAircraft.condition.toFixed(1)}%
                  </strong>
                </div>
                <div>
                  <span>PURCHASE PRICE</span>
                  <strong>
                    {formatMoney(
                      primaryAircraft.purchasePrice,
                    )}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="aircraft-banner">
                <div className="plane-large">
                  <Plane />
                </div>

                <div>
                  <span className="panel-eyebrow">
                    FLEET DEVELOPMENT
                  </span>
                  <h2>No aircraft acquired</h2>
                  <p>
                    Compare the available aircraft below
                    and make the airline&apos;s first
                    capital investment.
                  </p>
                </div>
              </div>

              <div className="spec-grid">
                <div>
                  <span>OWNED</span>
                  <strong>0 aircraft</strong>
                </div>
                <div>
                  <span>FLEET VALUE</span>
                  <strong>{formatMoney(0)}</strong>
                </div>
                <div>
                  <span>MONTHLY LEASES</span>
                  <strong>{formatMoney(0)}</strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong>Pre-operations</strong>
                </div>
              </div>
            </>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading compact">
            <div>
              <span className="panel-eyebrow">
                OWNED FLEET
              </span>
              <h2>Aircraft register</h2>
            </div>
            <span className="fleet-count">
              {game.fleet.length} aircraft
            </span>
          </div>

          <div className="maintenance-list">
            {game.fleet.length > 0 ? (
              game.fleet.map((item) => (
                <div key={item.id}>
                  <span>
                    <Plane />
                    {item.registration} ·{" "}
                    {item.aircraft.model}
                  </span>
                  <strong>
                    {item.status === "parked"
                      ? "Parked"
                      : item.status === "active"
                        ? "Active"
                        : "Maintenance"}
                  </strong>
                </div>
              ))
            ) : (
              <>
                <div>
                  <span>
                    <Gauge />
                    Aircraft owned
                  </span>
                  <strong>0</strong>
                </div>
                <div>
                  <span>
                    <ShieldCheck />
                    Fleet condition
                  </span>
                  <strong>Not applicable</strong>
                </div>
                <div>
                  <span>
                    <CalendarDays />
                    Next fleet event
                  </span>
                  <strong>
                    Purchase an aircraft
                  </strong>
                </div>
              </>
            )}
          </div>
        </article>
      </div>

      <article className="panel fleet-market-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              AIRCRAFT MARKET
            </span>
            <h2>Purchase aircraft</h2>
          </div>

          <div className="fleet-market-cash">
            <span>AVAILABLE CASH</span>
            <strong>{formatMoney(game.cash)}</strong>
          </div>
        </div>

        <div className="aircraft-market-grid">
          {aircraft.map((item) => {
            const purchasePrice =
              aircraftPurchasePrices[item.model];
            const affordable =
              game.cash >= purchasePrice;

            return (
              <article
                className="aircraft-market-card"
                key={item.model}
              >
                <div className="market-aircraft-icon">
                  <Plane />
                </div>

                <span>{item.family}</span>
                <h3>{item.model}</h3>

                <dl>
                  <div>
                    <dt>Seats</dt>
                    <dd>{item.seats}</dd>
                  </div>
                  <div>
                    <dt>Range</dt>
                    <dd>
                      {item.range.toLocaleString()} km
                    </dd>
                  </div>
                  <div>
                    <dt>Cruise</dt>
                    <dd>
                      {item.cruiseSpeed.toLocaleString()} km/h
                    </dd>
                  </div>
                  <div>
                    <dt>Reliability</dt>
                    <dd>{item.reliability}%</dd>
                  </div>
                </dl>

                <div className="aircraft-market-price">
                  <span>PURCHASE PRICE</span>
                  <strong>
                    {formatMoney(purchasePrice)}
                  </strong>
                </div>

                <Button
                  className="gold-button"
                  disabled={!affordable}
                  onClick={() => {
                    const confirmed =
                      window.confirm(
                        `Purchase ${item.model} for ${formatMoney(
                          purchasePrice,
                        )}?`,
                      );

                    if (confirmed) {
                      onPurchaseAircraft(
                        item.model,
                      );
                    }
                  }}
                >
                  <ShoppingCart />
                  {affordable
                    ? "Purchase aircraft"
                    : "Insufficient cash"}
                </Button>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
