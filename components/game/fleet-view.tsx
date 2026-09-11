"use client";

import { useState } from "react";
import {
  CalendarDays,
  Gauge,
  Plane,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/game-data";
import {
  aircraftMarketOffers,
  type AircraftAcquisitionMethod,
  type AircraftMarketOffer,
} from "@/lib/game/fleet";
import type {
  AircraftMarket,
  AirlineState,
} from "@/types/game";

const marketLabels: Record<
  AircraftMarket,
  string
> = {
  new: "New aircraft",
  used: "Used aircraft",
  lessor: "Lessors",
};

export function FleetView({
  game,
  onAcquireAircraft,
}: {
  game: AirlineState;
  onAcquireAircraft: (
    offerId: string,
    method: AircraftAcquisitionMethod,
  ) => void;
}) {
  const [market, setMarket] =
    useState<AircraftMarket>("new");
  const primaryAircraft =
    game.fleet[0] ?? null;
  const ownedCount = game.fleet.filter(
    (item) =>
      item.acquisitionType === "owned",
  ).length;
  const leasedCount = game.fleet.filter(
    (item) =>
      item.acquisitionType === "leased",
  ).length;
  const financedCount = game.fleet.filter(
    (item) =>
      item.acquisitionType === "financed",
  ).length;
  const fleetValue = game.fleet.reduce(
    (total, item) =>
      item.acquisitionType === "leased"
        ? total
        : total + item.purchasePrice,
    0,
  );
  const monthlyCommitments =
    game.fleet.reduce(
      (total, item) =>
        total + item.monthlyPayment,
      0,
    );
  const visibleOffers =
    aircraftMarketOffers.filter(
      (offer) => offer.market === market,
    );
  const manufacturers = [
    ...new Set(
      visibleOffers.map(
        (offer) => offer.manufacturer,
      ),
    ),
  ];

  const requestAcquisition = (
    offer: AircraftMarketOffer,
    method: AircraftAcquisitionMethod,
  ) => {
    const message =
      method === "cash"
        ? `Purchase ${offer.aircraft.model} for ${formatMoney(
            offer.cashPrice,
          )} in cash?`
        : method === "finance"
          ? `Finance ${offer.aircraft.model} with a ${formatMoney(
              offer.financeDeposit,
            )} deposit and ${formatMoney(
              offer.financeMonthlyPayment,
            )} per month for ${offer.financeTermMonths} months?`
          : `Lease ${offer.aircraft.model} from ${offer.provider} for ${formatMoney(
              offer.monthlyLease,
            )} per month? The upfront deposit is ${formatMoney(
              offer.monthlyLease * 3,
            )}.`;

    if (window.confirm(message)) {
      onAcquireAircraft(
        offer.id,
        method,
      );
    }
  };

  return (
    <section className="fleet-page">
      <div className="fleet-ownership-summary">
        <article>
          <span>TOTAL FLEET</span>
          <strong>{game.fleet.length}</strong>
        </article>
        <article>
          <span>OWNED</span>
          <strong>{ownedCount}</strong>
        </article>
        <article>
          <span>LEASED</span>
          <strong>{leasedCount}</strong>
        </article>
        <article>
          <span>UNDER FINANCE</span>
          <strong>{financedCount}</strong>
        </article>
        <article>
          <span>FLEET VALUE</span>
          <strong>
            {formatMoney(fleetValue)}
          </strong>
        </article>
        <article>
          <span>MONTHLY COMMITMENTS</span>
          <strong>
            {formatMoney(monthlyCommitments)}
          </strong>
        </article>
      </div>

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
                    {primaryAircraft.acquisitionType.toUpperCase()}
                  </span>
                  <h2>
                    {primaryAircraft.aircraft.model}
                  </h2>
                  <p>
                    {primaryAircraft.aircraft.family} ·{" "}
                    {primaryAircraft.aircraft.seats} seats ·{" "}
                    {primaryAircraft.manufactureYear} airframe
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
                  <span>FLIGHT HOURS</span>
                  <strong>
                    {primaryAircraft.flightHours.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span>CONDITION</span>
                  <strong>
                    {primaryAircraft.condition.toFixed(1)}%
                  </strong>
                </div>
                <div>
                  <span>STATUS</span>
                  <strong>
                    {primaryAircraft.status}
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
                    Compare manufacturer, used and
                    lessor offers below.
                  </p>
                </div>
              </div>

              <div className="spec-grid">
                <div>
                  <span>OWNED</span>
                  <strong>0 aircraft</strong>
                </div>
                <div>
                  <span>LEASED</span>
                  <strong>0 aircraft</strong>
                </div>
                <div>
                  <span>FINANCED</span>
                  <strong>0 aircraft</strong>
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
                OWNED & CONTRACTED FLEET
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
                    {item.acquisitionType ===
                    "financed"
                      ? "Under finance"
                      : item.acquisitionType}
                  </strong>
                </div>
              ))
            ) : (
              <>
                <div>
                  <span>
                    <Gauge />
                    Aircraft registered
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
                    Acquire an aircraft
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
              AIRCRAFT ACQUISITION
            </span>
            <h2>Aircraft markets</h2>
          </div>

          <div className="fleet-market-cash">
            <span>AVAILABLE CASH</span>
            <strong>{formatMoney(game.cash)}</strong>
          </div>
        </div>

        <div
          className="aircraft-market-tabs"
          aria-label="Aircraft markets"
        >
          {(
            Object.keys(
              marketLabels,
            ) as AircraftMarket[]
          ).map((marketId) => (
            <button
              type="button"
              key={marketId}
              className={
                market === marketId
                  ? "active"
                  : ""
              }
              onClick={() =>
                setMarket(marketId)
              }
            >
              <span>
                {marketLabels[marketId]}
              </span>
              <small>
                {
                  aircraftMarketOffers.filter(
                    (offer) =>
                      offer.market ===
                      marketId,
                  ).length
                }{" "}
                offers
              </small>
            </button>
          ))}
        </div>

        <p className="aircraft-market-note">
          {market === "new"
            ? "Factory-new aircraft are available for cash purchase or long-term finance."
            : market === "used"
              ? "Pre-owned aircraft trade at lower prices, with age, utilisation and condition affecting value."
              : "Operating leases require a three-month deposit and create a continuing monthly commitment."}
        </p>

        <div className="manufacturer-groups">
          {manufacturers.map(
            (manufacturer) => (
              <section
                className="manufacturer-market"
                key={manufacturer}
              >
                <header>
                  <div>
                    <span>MANUFACTURER</span>
                    <h3>{manufacturer}</h3>
                  </div>
                  <small>
                    {
                      visibleOffers.filter(
                        (offer) =>
                          offer.manufacturer ===
                          manufacturer,
                      ).length
                    }{" "}
                    available
                  </small>
                </header>

                <div className="aircraft-market-grid">
                  {visibleOffers
                    .filter(
                      (offer) =>
                        offer.manufacturer ===
                        manufacturer,
                    )
                    .map((offer) => {
                      const cashAffordable =
                        game.cash >=
                        offer.cashPrice;
                      const financeAffordable =
                        game.cash >=
                        offer.financeDeposit;
                      const leaseDeposit =
                        offer.monthlyLease * 3;
                      const leaseAffordable =
                        game.cash >=
                        leaseDeposit;

                      return (
                        <article
                          className="aircraft-market-card"
                          key={offer.id}
                        >
                          <div className="market-aircraft-icon">
                            <Plane />
                          </div>

                          <span>
                            {offer.provider}
                          </span>
                          <h3>
                            {offer.aircraft.model}
                          </h3>

                          <dl>
                            <div>
                              <dt>Seats</dt>
                              <dd>
                                {offer.aircraft.seats}
                              </dd>
                            </div>
                            <div>
                              <dt>Range</dt>
                              <dd>
                                {offer.aircraft.range.toLocaleString()}{" "}
                                km
                              </dd>
                            </div>
                            <div>
                              <dt>Year</dt>
                              <dd>
                                {
                                  offer.manufactureYear
                                }
                              </dd>
                            </div>
                            <div>
                              <dt>Flight hours</dt>
                              <dd>
                                {offer.flightHours.toLocaleString()}
                              </dd>
                            </div>
                            <div>
                              <dt>Condition</dt>
                              <dd>
                                {offer.condition}%
                              </dd>
                            </div>
                            <div>
                              <dt>Reliability</dt>
                              <dd>
                                {
                                  offer.aircraft
                                    .reliability
                                }
                                %
                              </dd>
                            </div>
                          </dl>

                          {market === "lessor" ? (
                            <>
                              <div className="aircraft-market-price">
                                <span>
                                  MONTHLY LEASE
                                </span>
                                <strong>
                                  {formatMoney(
                                    offer.monthlyLease,
                                  )}
                                </strong>
                                <small>
                                  Deposit:{" "}
                                  {formatMoney(
                                    leaseDeposit,
                                  )}
                                </small>
                              </div>

                              <Button
                                className="gold-button"
                                disabled={
                                  !leaseAffordable
                                }
                                onClick={() =>
                                  requestAcquisition(
                                    offer,
                                    "lease",
                                  )
                                }
                              >
                                <ShoppingCart />
                                {leaseAffordable
                                  ? "Lease aircraft"
                                  : "Deposit unaffordable"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="aircraft-market-price">
                                <span>
                                  CASH PRICE
                                </span>
                                <strong>
                                  {formatMoney(
                                    offer.cashPrice,
                                  )}
                                </strong>
                                <small>
                                  Finance deposit:{" "}
                                  {formatMoney(
                                    offer.financeDeposit,
                                  )}
                                </small>
                              </div>

                              <div className="aircraft-acquisition-actions">
                                <Button
                                  variant="outline"
                                  disabled={
                                    !cashAffordable
                                  }
                                  onClick={() =>
                                    requestAcquisition(
                                      offer,
                                      "cash",
                                    )
                                  }
                                >
                                  {cashAffordable
                                    ? "Buy cash"
                                    : "Cash unavailable"}
                                </Button>

                                <Button
                                  className="gold-button"
                                  disabled={
                                    !financeAffordable
                                  }
                                  onClick={() =>
                                    requestAcquisition(
                                      offer,
                                      "finance",
                                    )
                                  }
                                >
                                  <ShoppingCart />
                                  {financeAffordable
                                    ? "Finance"
                                    : "Deposit unavailable"}
                                </Button>
                              </div>

                              <small className="finance-terms">
                                {formatMoney(
                                  offer.financeMonthlyPayment,
                                )}
                                /month ·{" "}
                                {
                                  offer.financeTermMonths
                                }{" "}
                                months ·{" "}
                                {(
                                  offer.financeAnnualRate *
                                  100
                                ).toFixed(1)}
                                %
                              </small>
                            </>
                          )}
                        </article>
                      );
                    })}
                </div>
              </section>
            ),
          )}
        </div>
      </article>
    </section>
  );
}
