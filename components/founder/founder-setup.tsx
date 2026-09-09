"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  Clock3,
  Fuel,
  Layers3,
  MapPin,
  Plane,
  PlaneTakeoff,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  aircraft,
  formatMoney,
  hubs,
  routeSeeds,
  strategies,
  type Hub,
  type RouteSeed,
  type Strategy,
} from "@/lib/game-data";
import {
  buildStarterRoutes,
  calculateBlockTime,
  formatAnnualTraffic,
  searchAirports,
} from "@/lib/airport-system";
import { createInitialCareer } from "@/lib/game/create-career";
import type { AirlineState } from "@/types/game";

export function FounderSetup({
  onLaunch,
  onBack,
}: {
  onLaunch: (game: AirlineState) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Aurelia Air");
  const [ceoName, setCeoName] = useState("");
  const [ceoNationality, setCeoNationality] = useState("");
  const [ceoAge, setCeoAge] = useState(35);
  const [ceoBackground, setCeoBackground] = useState("");
  const [iata, setIata] = useState("AU");
  const [icao, setIcao] = useState("AUR");
  const [hub, setHub] = useState<Hub>(hubs[0]);
  const [hubQuery, setHubQuery] = useState(
    "JNB · O.R. Tambo International",
  );
  const [hubResults, setHubResults] = useState<Hub[]>(hubs);
  const [hubSearchOpen, setHubSearchOpen] = useState(false);
  const [hubSearchBusy, setHubSearchBusy] = useState(false);
  const [strategyId, setStrategyId] =
    useState<Strategy["id"]>("network");
  const [aircraftModel, setAircraftModel] =
    useState("Embraer E195-E2");
  const [routeCode, setRouteCode] = useState("CPT");
  const [availableRoutes, setAvailableRoutes] = useState<RouteSeed[]>(
    routeSeeds.JNB,
  );
  const [routesLoading, setRoutesLoading] = useState(false);

  const strategy =
    strategies.find((item) => item.id === strategyId) ?? strategies[1];

  const selectedAircraft =
    aircraft.find((item) => item.model === aircraftModel) ?? aircraft[1];

  const baseRoute =
    availableRoutes.find((item) => item.to === routeCode) ??
    availableRoutes[0] ??
    routeSeeds.JNB[0];

  const route: RouteSeed = {
    ...baseRoute,
    blockTime: calculateBlockTime(
      baseRoute.distance,
      selectedAircraft.cruiseSpeed,
      hub.slotPressure,
    ),
  };

  useEffect(() => {
    if (!hubSearchOpen) return;

    const searchText = hubQuery.trim();

    if (
      searchText.length < 2 ||
      searchText === `${hub.code} · ${hub.name}`
    ) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setHubSearchBusy(true);

      const results = await searchAirports(searchText);

      if (!cancelled) {
        setHubResults(results);
        setHubSearchBusy(false);
      }
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hubQuery, hubSearchOpen, hub.code, hub.name]);

  useEffect(() => {
    const presetRoutes = routeSeeds[hub.code];

    if (presetRoutes) return;

    let cancelled = false;

    buildStarterRoutes(hub).then((routes) => {
      if (cancelled) return;

      setAvailableRoutes(routes);

      if (routes[0]) {
        setRouteCode(routes[0].to);
      }

      setRoutesLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [hub]);

  const selectHub = (selectedHub: Hub) => {
    const presetRoutes = routeSeeds[selectedHub.code];

    if (presetRoutes) {
      setAvailableRoutes(presetRoutes);
      setRouteCode(presetRoutes[0].to);
      setRoutesLoading(false);
    } else {
      setRoutesLoading(true);
    }

    setHub(selectedHub);
    setHubQuery(`${selectedHub.code} · ${selectedHub.name}`);
    setHubSearchOpen(false);
    setHubResults([]);
  };

  const launch = () => {
    onLaunch(
      createInitialCareer({
        airlineName: name,
        ceoName,
        ceoNationality,
        ceoAge,
        ceoBackground,
        iata,
        icao,
        hub,
        strategy,
        aircraft: selectedAircraft,
        route,
      }),
    );
  };

  return (
    <div className="founder-shell">
      <aside className="founder-aside">
        <Brand />

        <div className="founder-copy">
          <p className="eyebrow">NEW CAREER · 2026</p>

          <h1>Build an airline the world remembers.</h1>

          <p>
            Every seat, slot and decision matters. Establish your
            headquarters, define the business and put your first aircraft into
            service.
          </p>
        </div>

        <div className="setup-steps">
          {[
            [1, "Corporate identity", "Name, codes and headquarters"],
            [2, "Operating model", "Strategy and first aircraft"],
            [3, "Launch network", "Open your first route"],
          ].map(([number, title, detail]) => (
            <button
              key={number}
              className={`setup-step ${
                step === number ? "active" : ""
              } ${
                step > Number(number) ? "complete" : ""
              }`}
              onClick={() =>
                step > Number(number) &&
                setStep(Number(number))
              }
            >
              <span>
                {step > Number(number) ? <Check /> : number}
              </span>

              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
            </button>
          ))}
        </div>

        <div className="founder-footer">
          <ShieldCheck />
          Career data saves automatically on this device
        </div>
      </aside>

      <main className="setup-panel">
        <div className="setup-progress">
          <span style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <section className="setup-content hub-setup-content">
            <div className="section-number">01 / 03</div>

            <h2>Build your corporate identity</h2>

            <p className="setup-lead">
              Name the airline, reserve its operating codes and choose any
              coded airport as your headquarters.
            </p>

                        <div className="form-grid">
              <div className="field full">
                <Label htmlFor="ceo-name">Chief executive name</Label>

                <Input
                  id="ceo-name"
                  value={ceoName}
                  onChange={(event) =>
                    setCeoName(event.target.value)
                  }
                  placeholder="Enter your virtual CEO name"
                  maxLength={50}
                />
              </div>

              <div className="field">
                <Label htmlFor="ceo-nationality">
                  Nationality
                </Label>

                <Input
                  id="ceo-nationality"
                  value={ceoNationality}
                  onChange={(event) =>
                    setCeoNationality(event.target.value)
                  }
                  placeholder="e.g. Zimbabwean"
                  maxLength={40}
                />
              </div>

              <div className="field">
                <Label htmlFor="ceo-age">Age</Label>

                <Input
                  id="ceo-age"
                  type="number"
                  value={ceoAge}
                  onChange={(event) =>
                    setCeoAge(Number(event.target.value))
                  }
                  min={18}
                  max={100}
                />
              </div>

              <div className="field full">
                <Label htmlFor="ceo-background">
                  Professional background
                </Label>

                <Input
                  id="ceo-background"
                  value={ceoBackground}
                  onChange={(event) =>
                    setCeoBackground(event.target.value)
                  }
                  placeholder="e.g. Aviation management, finance or entrepreneurship"
                  maxLength={80}
                />
              </div>

              <div className="field full">
                <Label htmlFor="airline-name">Airline name</Label>

                <Input
                  id="airline-name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  maxLength={32}
                />
              </div>

              <div className="field">
                <Label htmlFor="iata">IATA airline code</Label>

                <Input
                  id="iata"
                  value={iata}
                  onChange={(event) =>
                    setIata(
                      event.target.value
                        .replace(/[^a-z0-9]/gi, "")
                        .toUpperCase(),
                    )
                  }
                  maxLength={2}
                />
              </div>

              <div className="field">
                <Label htmlFor="icao">ICAO airline code</Label>

                <Input
                  id="icao"
                  value={icao}
                  onChange={(event) =>
                    setIcao(
                      event.target.value
                        .replace(/[^a-z]/gi, "")
                        .toUpperCase(),
                    )
                  }
                  maxLength={3}
                />
              </div>

              <div className="field full hub-search-field">
                <Label htmlFor="hub-search">
                  Headquarters & primary hub
                </Label>

                <div className="airport-search-box">
                  <Search />

                  <Input
                    id="hub-search"
                    value={hubQuery}
                    onChange={(event) => {
                      setHubQuery(event.target.value);
                      setHubSearchOpen(true);
                    }}
                    onFocus={() => {
                      setHubSearchOpen(true);
                      setHubResults(hubs);
                    }}
                    onBlur={() =>
                      window.setTimeout(
                        () => setHubSearchOpen(false),
                        160,
                      )
                    }
                    placeholder="Search by airport name, IATA or ICAO code"
                    autoComplete="off"
                  />

                  {hubSearchBusy && (
                    <span className="airport-search-spinner" />
                  )}

                  {hubSearchOpen && (
                    <div className="airport-search-results">
                      <div className="airport-results-label">
                        {hubQuery.length >= 2
                          ? "WORLDWIDE AIRPORT RESULTS"
                          : "FEATURED HUBS"}
                      </div>

                      {hubResults.length > 0 ? (
                        hubResults.map((item) => (
                          <button
                            type="button"
                            key={`${item.code}-${item.icao}`}
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() => selectHub(item)}
                          >
                            <span className="result-code">
                              {item.code}
                            </span>

                            <span>
                              <strong>{item.name}</strong>

                              <small>
                                {item.city} · {item.country}
                              </small>
                            </span>

                            <em>{item.icao || "NO ICAO"}</em>
                          </button>
                        ))
                      ) : (
                        !hubSearchBusy && (
                          <div className="airport-no-results">
                            No coded airport found. Try an IATA code, ICAO
                            code, city or airport name.
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <small className="field-help">
                  Worldwide reference catalogue via airport-data-js · Search
                  examples: JNB, FVRG, HRE or Heathrow
                </small>
              </div>
            </div>

            <article className="hub-intelligence-card">
              <header className="hub-intelligence-header">
                <div className="airport-code-block">
                  <strong>{hub.code}</strong>
                  <span>{hub.icao || "ICAO N/A"}</span>
                </div>

                <div className="airport-identity">
                  <span className="intel-eyebrow">
                    <MapPin />
                    SELECTED PRIMARY HUB
                  </span>

                  <h3>{hub.name}</h3>

                  <p>
                    {hub.city}, {hub.country} ·{" "}
                    {hub.airportType ?? "Commercial airport"}
                  </p>
                </div>

                <div className="hybrid-badge">
                  <i />
                  HYBRID DATA
                </div>
              </header>

              <div className="hub-intelligence-grid">
                <div>
                  <span>
                    <PlaneTakeoff />
                    RUNWAYS
                  </span>

                  <strong>{hub.runwayCount ?? 1}</strong>
                  <small>Longest {hub.runway}</small>
                </div>

                <div>
                  <span>
                    <Building2 />
                    TERMINALS
                  </span>

                  <strong>{hub.terminalCount ?? 1}</strong>

                  <small>
                    {hub.infrastructureSource ??
                      "Modelled estimate"}
                  </small>
                </div>

                <div>
                  <span>
                    <Clock3 />
                    SLOT AVAILABILITY
                  </span>

                  <strong>
                    {hub.availableSlotsPercent ?? 30}%
                  </strong>

                  <small>
                    {hub.slotCapacityPerHour ?? 32} movements/hour ·{" "}
                    {hub.slotPressure} pressure
                  </small>
                </div>

                <div>
                  <span>
                    <Users />
                    PASSENGER DEMAND
                  </span>

                  <strong>
                    {hub.passengerDemand ?? 50}
                    <em>/100</em>
                  </strong>

                  <small>{hub.market} market model</small>
                </div>

                <div>
                  <span>
                    <Layers3 />
                    PASSENGER TRAFFIC
                  </span>

                  <strong>
                    {formatAnnualTraffic(
                      hub.annualPassengers,
                    )}
                  </strong>

                  <small>annual simulation estimate</small>
                </div>

                <div>
                  <span>
                    <Boxes />
                    CARGO TRAFFIC
                  </span>

                  <strong>
                    {formatAnnualTraffic(
                      hub.annualCargoTonnes,
                      " t",
                    )}
                  </strong>

                  <small>
                    annual simulation estimate · demand{" "}
                    {hub.cargoDemand ?? 50}/100
                  </small>
                </div>
              </div>

              <footer>
                <span>
                  <i className="reference-dot" />
                  Infrastructure:{" "}
                  {hub.infrastructureSource ??
                    "Modelled estimate"}
                </span>

                <span>
                  <i className="simulation-dot" />
                  Demand, slots and traffic: simulation estimates
                </span>

                <span>
                  Elevation{" "}
                  {Math.round(
                    hub.elevationFt ?? 0,
                  ).toLocaleString()}{" "}
                  ft
                </span>
              </footer>
            </article>
          </section>
        )}

        {step === 2 && (
          <section className="setup-content wide">
            <div className="section-number">02 / 03</div>

            <h2>Choose your operating model</h2>

            <p className="setup-lead">
              Your strategy influences available capital, passenger demand and
              ticket yield.
            </p>

            <div className="choice-grid strategy-grid">
              {strategies.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStrategyId(item.id)}
                  className={`choice-card ${
                    strategyId === item.id ? "selected" : ""
                  }`}
                >
                  <div className="choice-check">
                    {strategyId === item.id && <Check />}
                  </div>

                  <span className="card-kicker">
                    {formatMoney(item.capital)} CAPITAL
                  </span>

                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="choice-metrics">
                    <span>
                      Yield{" "}
                      <b>
                        {Math.round(
                          item.fareMultiplier * 100,
                        )}
                        %
                      </b>
                    </span>

                    <span>
                      Demand{" "}
                      <b>
                        {Math.round(
                          item.demandMultiplier * 100,
                        )}
                        %
                      </b>
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="subhead">
              <div>
                <span>FIRST AIRCRAFT</span>
                <strong>
                  Operating lease · 36 months
                </strong>
              </div>

              <Fuel />
            </div>

            <div className="aircraft-choice-list">
              {aircraft.map((item) => (
                <button
                  key={item.model}
                  className={`aircraft-choice ${
                    aircraftModel === item.model
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setAircraftModel(item.model)
                  }
                >
                  <span className="aircraft-radio" />

                  <div className="plane-silhouette">
                    <Plane />
                  </div>

                  <div className="aircraft-title">
                    <strong>{item.model}</strong>
                    <span>{item.family}</span>
                  </div>

                  <div>
                    <small>SEATS</small>
                    <strong>{item.seats}</strong>
                  </div>

                  <div>
                    <small>RANGE</small>
                    <strong>
                      {item.range.toLocaleString()} km
                    </strong>
                  </div>

                  <div>
                    <small>CRUISE SPEED</small>
                    <strong>
                      {item.cruiseSpeed.toLocaleString()} km/h
                    </strong>
                  </div>

                  <div>
                    <small>LEASE / MO</small>
                    <strong>
                      {formatMoney(item.monthlyLease)}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="setup-content wide">
            <div className="section-number">03 / 03</div>

            <h2>Open your first route</h2>

            <p className="setup-lead">
              Select the market that will define your airline’s opening
              chapter.
            </p>

            <div className="launch-layout">
              <div className="route-options">
                {routesLoading ? (
                  <div className="route-researching">
                    <span className="airport-search-spinner" />

                    <strong>
                      Analysing markets around {hub.code}
                    </strong>

                    <small>
                      Building realistic starter routes from the selected hub…
                    </small>
                  </div>
                ) : availableRoutes.length > 0 ? (
                  availableRoutes.map((item) => (
                    <button
                      key={item.to}
                      className={`route-option ${
                        routeCode === item.to ? "selected" : ""
                      }`}
                      onClick={() => setRouteCode(item.to)}
                    >
                      <span className="route-code">
                        {hub.code}
                        <ArrowRight />
                        {item.to}
                      </span>

                      <div>
                        <strong>{item.city}</strong>

                        <small>
                          {item.distance.toLocaleString()} km ·{" "}
                          {calculateBlockTime(
                            item.distance,
                            selectedAircraft.cruiseSpeed,
                            hub.slotPressure,
                          )}
                        </small>
                      </div>

                      <div className="demand-meter">
                        <span>DEMAND</span>
                        <b>{item.demand}</b>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="route-researching">
                    <strong>
                      No scheduled markets found
                    </strong>

                    <small>
                      Return to Corporate Identity and choose an airport with
                      scheduled service.
                    </small>
                  </div>
                )}
              </div>

              <div className="launch-summary">
                <p className="eyebrow">LAUNCH BRIEF</p>
                <h3>{name || "Your airline"}</h3>

                <div className="summary-route">
                  <span>{hub.code}</span>

                  <div>
                    <Plane />
                    <i />
                  </div>

                  <span>{route.to}</span>
                </div>

                <dl>
                  <div>
                    <dt>Aircraft</dt>
                    <dd>{selectedAircraft.model}</dd>
                  </div>

                  <div>
                    <dt>Route distance</dt>
                    <dd>
                      {route.distance.toLocaleString()} km
                    </dd>
                  </div>

                  <div>
                    <dt>Block time</dt>
                    <dd>{route.blockTime}</dd>
                  </div>

                  <div>
                    <dt>Weekly rotations</dt>
                    <dd>{route.weeklyFlights}</dd>
                  </div>

                  <div>
                    <dt>Opening cash</dt>

                    <dd>
                      {formatMoney(
                        strategy.capital -
                          selectedAircraft.monthlyLease * 3 -
                          4_800_000,
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt>Expected load factor</dt>

                    <dd>
                      {Math.round(
                        Math.min(
                          84,
                          route.demand *
                            0.76 *
                            strategy.demandMultiplier,
                        ),
                      )}
                      %
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        )}

        <footer className="setup-actions">
          <Button
            variant="ghost"
            onClick={() =>
              step === 1
                ? onBack()
                : setStep(step - 1)
            }
          >
            {step === 1 ? "Main menu" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              className="gold-button"
              onClick={() => setStep(step + 1)}
                disabled={
                !ceoName.trim() ||
                !ceoNationality.trim() ||
                ceoAge < 18 ||
                ceoAge > 100 ||
                !ceoBackground.trim() ||
                !name.trim() ||
                iata.length !== 2 ||
                icao.length !== 3
              }
            >
              Continue <ArrowRight />
            </Button>
          ) : (
            <Button
              className="gold-button"
              onClick={launch}
              disabled={
                routesLoading ||
                availableRoutes.length === 0
              }
            >
              Launch airline <PlaneTakeoff />
            </Button>
          )}
        </footer>
      </main>
    </div>
  );
}
