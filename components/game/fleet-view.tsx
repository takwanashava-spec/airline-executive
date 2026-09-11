"use client";

import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Plane,
  ShieldCheck,
  ShoppingCart,
  Gavel,
} from "lucide-react";

import { ManufacturerLogo } from "@/components/game/manufacturer-logo";
import { LessorMarket } from "@/components/game/lessor-market";
import { UsedAircraftMarket } from "@/components/game/used-aircraft-market";
import { FleetManagement, type FleetSection } from "@/components/game/fleet-management";
import { Button } from "@/components/ui/button";
import {
  aircraftManufacturers,
  formatMoney,
  type AircraftManufacturerId,
} from "@/lib/game-data";
import {
  aircraftMarketOffers,
  type AircraftAcquisitionMethod,
  type AircraftMarketOffer,
} from "@/lib/game/fleet";
import { auctionListings } from "@/lib/game/auctions";
import type { FleetAction } from "@/lib/game/fleet-operations";
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

function manufacturerDetails(
  manufacturerId: AircraftManufacturerId,
) {
  return (
    aircraftManufacturers.find(
      (manufacturer) =>
        manufacturer.id ===
        manufacturerId,
    ) ?? aircraftManufacturers[0]
  );
}

export function FleetView({
  game,
  onAcquireAircraft,
  onAuctionBid,
  onLeaseApply,
  onUsedInspect,
  onUsedOffer,
  onUsedFinance,
  onUsedBuy,
  onUsedWatchlist,
  onFleetAction,
}: {
  game: AirlineState;
  onAcquireAircraft: (
    offerId: string,
    method: AircraftAcquisitionMethod,
  ) => void;
  onAuctionBid: (listingId: string, amount: number) => void;
  onLeaseApply: (offerId: string) => void;
  onUsedInspect: (listingId: string, type: "records" | "physical") => void;
  onUsedOffer: (listingId: string, amount: number) => void;
  onUsedFinance: (listingId: string) => void;
  onUsedBuy: (listingId: string) => void;
  onUsedWatchlist: (listingId: string) => void;
  onFleetAction: (aircraftId: string, action: FleetAction, option?: string) => void;
}) {
  const [fleetSection, setFleetSection] = useState<FleetSection>("overview");
  const [market, setMarket] =
    useState<AircraftMarket>("new");
  const [
    selectedManufacturer,
    setSelectedManufacturer,
  ] = useState<AircraftManufacturerId | null>(
    null,
  );
  const [usedSection, setUsedSection] = useState<"dealer" | "auction">("dealer");
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
      <nav className="fleet-workspace-nav" aria-label="Fleet management sections">
        {([
          ["overview", "Fleet overview"],
          ["register", "Aircraft register"],
          ["induction", "Induction & delivery"],
          ["maintenance", "Maintenance"],
          ["acquisition", "Aircraft acquisition"],
        ] as [FleetSection, string][]).map(([id, label]) => (
          <button type="button" key={id} className={fleetSection === id ? "active" : ""} onClick={() => setFleetSection(id)}>{label}</button>
        ))}
      </nav>

      {fleetSection === "acquisition" ? (
        <>
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
              onClick={() => {
                setMarket(marketId);
                setSelectedManufacturer(
                  null,
                );
              }}
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
            ? "Select a manufacturer to enter its showroom and browse its current passenger-aircraft programmes."
            : market === "used"
              ? "Pre-owned aircraft trade at lower prices, with age, utilisation and condition affecting value."
              : "Operating leases require a three-month deposit and create a continuing monthly commitment."}
        </p>

        {market === "used" && (
          <div className="used-market-switch" aria-label="Used aircraft sales channel">
            <button type="button" className={usedSection === "dealer" ? "active" : ""} onClick={() => { setUsedSection("dealer"); setSelectedManufacturer(null); }}>Dealer listings</button>
            <button type="button" className={usedSection === "auction" ? "active" : ""} onClick={() => { setUsedSection("auction"); setSelectedManufacturer(null); }}><Gavel /> Auction market</button>
          </div>
        )}

        {market === "lessor" ? (
          <LessorMarket game={game} onApply={onLeaseApply} />
        ) : market === "used" && usedSection === "auction" ? (
          selectedManufacturer === null ? (
            <div className="manufacturer-directory">
              {[...new Set(auctionListings.map((listing) => listing.manufacturer))].map((manufacturer) => {
                const details = manufacturerDetails(manufacturer);
                const count = auctionListings.filter((listing) => listing.manufacturer === manufacturer).length;
                return <button type="button" className="manufacturer-directory-card" key={manufacturer} onClick={() => setSelectedManufacturer(manufacturer)}>
                  <ManufacturerLogo manufacturerId={manufacturer} />
                  <div><span>{details.fullName}</span><h3>{details.name} auction inventory</h3><small>{count} individual airframe{count === 1 ? "" : "s"}</small></div>
                  <footer><span><strong>{count}</strong> live auction listing{count === 1 ? "" : "s"}</span><ChevronRight /></footer>
                </button>;
              })}
            </div>
          ) : <>
          <div className="manufacturer-showroom-nav">
            <button type="button" onClick={() => setSelectedManufacturer(null)}><ChevronLeft />All manufacturers</button>
            <span>{manufacturerDetails(selectedManufacturer).name} auction inventory</span>
          </div>
          <div className="auction-grid">
            {auctionListings.filter((listing) => listing.manufacturer === selectedManufacturer).map((listing) => {
              const pending = game.auctionBids.some((bid) => bid.listingId === listing.id && bid.status === "pending");
              return <article className="auction-card" key={listing.id}>
                <header><span>LIVE AUCTION</span><strong>{listing.registration}</strong></header>
                <div className="market-aircraft-icon"><Gavel /></div>
                <h3>{listing.aircraft.model}</h3>
                <p>{listing.seller} · {listing.location}</p>
                <dl>
                  <div><dt>Serial</dt><dd>{listing.serialNumber}</dd></div>
                  <div><dt>Year</dt><dd>{listing.manufactureYear}</dd></div>
                  <div><dt>Hours</dt><dd>{listing.flightHours.toLocaleString()}</dd></div>
                  <div><dt>Cycles</dt><dd>{listing.flightCycles.toLocaleString()}</dd></div>
                  <div><dt>Condition</dt><dd>{listing.condition}%</dd></div>
                  <div><dt>Current bid</dt><dd>{formatMoney(listing.currentBid)}</dd></div>
                </dl>
                <Button className="gold-button" disabled={pending} onClick={() => {
                  const value = window.prompt(`Enter a bid above ${formatMoney(listing.currentBid)}`);
                  if (value === null) return;
                  onAuctionBid(listing.id, Number(value.replace(/[^0-9.]/g, "")));
                }}>{pending ? "Decision pending" : "Place bid"}</Button>
                <small>A formal decision will arrive in your inbox within one game day.</small>
              </article>;
            })}
          </div>
          </>
        ) : market === "used" ? (
          <UsedAircraftMarket
            game={game}
            onInspect={onUsedInspect}
            onOffer={onUsedOffer}
            onFinance={onUsedFinance}
            onBuy={onUsedBuy}
            onWatchlist={onUsedWatchlist}
          />
        ) : (

        selectedManufacturer === null ? (
          <div className="manufacturer-directory">
            {manufacturers.map(
              (manufacturer) => {
                const details =
                  manufacturerDetails(
                    manufacturer,
                  );
                const offerCount =
                  visibleOffers.filter(
                    (offer) =>
                      offer.manufacturer ===
                      manufacturer,
                  ).length;
                const familyCount =
                  new Set(
                    visibleOffers
                      .filter(
                        (offer) =>
                          offer.manufacturer ===
                          manufacturer,
                      )
                      .map(
                        (offer) =>
                          offer.aircraft.family,
                      ),
                  ).size;

                return (
                  <button
                    type="button"
                    className="manufacturer-directory-card"
                    key={manufacturer}
                    onClick={() =>
                      setSelectedManufacturer(
                        manufacturer,
                      )
                    }
                  >
                    <ManufacturerLogo
                      manufacturerId={
                        manufacturer
                      }
                    />
                    <div>
                      <span>
                        {details.fullName}
                      </span>
                      <h3>{details.division}</h3>
                      <small>
                        {details.headquarters}
                      </small>
                    </div>
                    <footer>
                      <span>
                        <strong>
                          {offerCount}
                        </strong>{" "}
                        models · {familyCount}{" "}
                        families
                      </span>
                      <ChevronRight />
                    </footer>
                  </button>
                );
              },
            )}
          </div>
        ) : (
          <>
            <div className="manufacturer-showroom-nav">
              <button
                type="button"
                onClick={() =>
                  setSelectedManufacturer(
                    null,
                  )
                }
              >
                <ChevronLeft />
                All manufacturers
              </button>
              <span>
                {
                  manufacturerDetails(
                    selectedManufacturer,
                  ).name
                }{" "}
                showroom
              </span>
            </div>

            <div className="manufacturer-groups">
          {manufacturers
            .filter(
              (manufacturer) =>
                manufacturer ===
                selectedManufacturer,
            )
            .map(
            (manufacturer) => (
              <section
                className="manufacturer-market"
                key={manufacturer}
              >
                <header>
                  <ManufacturerLogo
                    manufacturerId={
                      manufacturer
                    }
                  />
                  <div className="manufacturer-market-identity">
                    <span>
                      {
                        manufacturerDetails(
                          manufacturer,
                        ).fullName
                      }
                    </span>
                    <h3>
                      {
                        manufacturerDetails(
                          manufacturer,
                        ).division
                      }
                    </h3>
                    <small>
                      {
                        manufacturerDetails(
                          manufacturer,
                        ).headquarters
                      }
                    </small>
                  </div>
                  <small className="manufacturer-offer-count">
                    {
                      visibleOffers.filter(
                        (offer) =>
                          offer.manufacturer ===
                          manufacturer,
                      ).length
                    }{" "}
                    models
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
                      const unavailable =
                        offer.aircraft
                          .availability ===
                        "development";
                      const cashAffordable =
                        !unavailable &&
                        game.cash >=
                          offer.cashPrice;
                      const financeAffordable =
                        !unavailable &&
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

                          <div className="aircraft-offer-meta">
                            <span>
                              {offer.provider}
                            </span>
                            <em
                              className={
                                offer.aircraft
                                  .availability ===
                                "development"
                                  ? "development"
                                  : ""
                              }
                            >
                              {offer.aircraft
                                .availability ===
                              "development"
                                ? "In development"
                                : "In production"}
                            </em>
                          </div>
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
                            <div className="aircraft-engine-spec">
                              <dt>Engine</dt>
                              <dd>
                                {
                                  offer.aircraft
                                    .engine
                                }
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
                                  {unavailable
                                    ? "Not yet deliverable"
                                    : cashAffordable
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
                                  {unavailable
                                    ? "Not yet deliverable"
                                    : financeAffordable
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
          </>
        )
        )}
      </article>
        </>
      ) : (
        <FleetManagement game={game} section={fleetSection} onAction={onFleetAction} />
      )}
    </section>
  );
}
