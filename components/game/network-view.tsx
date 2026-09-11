"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CheckCircle2, MapPin, Plane, Search, Send, TrendingUp } from "lucide-react";
import { RouteMap } from "@/components/game/command-centre";
import { Button } from "@/components/ui/button";
import { searchAirports } from "@/lib/airport-system";
import { routeMarketAnalysis, type RoutePlanInput } from "@/lib/game/routes";
import type { Hub } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Section = "overview" | "planner" | "applications";

export function NetworkView({ game, onSubmitSlotApplication }: { game: AirlineState; onSubmitSlotApplication: (input: RoutePlanInput) => void }) {
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hub[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [searchFailed, setSearchFailed] = useState(false);
  const [destination, setDestination] = useState<Hub | null>(null);
  const [aircraftId, setAircraftId] = useState("");
  const [frequency, setFrequency] = useState(7);
  const [fare, setFare] = useState(0);
  const [departureTime, setDepartureTime] = useState("08:00");
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const activeRoutes = game.routePlans.filter((plan) => plan.status === "active");
  const readyAircraft = game.fleet.filter((item) => item.status === "parked" && item.inductionStage === "complete");
  const analysis = useMemo(() => destination ? routeMarketAnalysis(game.hub, destination) : null, [destination, game.hub]);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = window.setTimeout(() => {
      setSearching(true);
      setSearchFailed(false);
      searchAirports(query)
        .then((items) => {
          setResults(items.filter((item) => item.code !== game.hub.code));
          setSearchedQuery(query.trim());
        })
        .catch(() => {
          setResults([]);
          setSearchedQuery(query.trim());
          setSearchFailed(true);
        })
        .finally(() => setSearching(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, game.hub.code]);

  const chooseDestination = (hub: Hub) => {
    const market = routeMarketAnalysis(game.hub, hub);
    setDestination(hub); setFare(market.suggestedFare); setQuery(""); setResults([]);
  };
  const submit = () => {
    if (!destination) return;
    onSubmitSlotApplication({ destination, aircraftId, weeklyFlights: frequency, baseFare: fare, departureTime, operatingDays: days });
    setSection("applications");
  };

  return <section className="route-workspace">
    <nav className="route-workspace-nav">
      <button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}>Network overview</button>
      <button className={section === "planner" ? "active" : ""} onClick={() => setSection("planner")}>Plan a route</button>
      <button className={section === "applications" ? "active" : ""} onClick={() => setSection("applications")}>Slots & launches <span>{game.slotApplications.filter((item) => item.status === "pending").length}</span></button>
    </nav>

    {section === "overview" && <>
      <article className="panel module-hero"><div className="panel-heading"><div><span className="panel-eyebrow">NETWORK CONTROL</span><h2>{game.hub.city} hub network</h2></div><span className="status-on-time">{activeRoutes.length} ACTIVE {activeRoutes.length === 1 ? "ROUTE" : "ROUTES"}</span></div><RouteMap game={game} /></article>
      <article className="panel route-register"><div className="panel-heading compact"><div><span className="panel-eyebrow">OPERATING NETWORK</span><h2>Route register</h2></div><Button onClick={() => setSection("planner")}><Plane /> Plan new route</Button></div>
        {activeRoutes.length ? <div className="route-register-table"><table><thead><tr><th>Route</th><th>Aircraft</th><th>Frequency</th><th>Departure</th><th>Demand</th><th>Status</th></tr></thead><tbody>{activeRoutes.map((plan) => { const aircraft = game.fleet.find((item) => item.id === plan.aircraftId); return <tr key={plan.id}><td><strong>{plan.from} <ArrowRight /> {plan.destination.code}</strong><small>{plan.destination.city} · {plan.distance.toLocaleString()} km</small></td><td><strong>{aircraft?.registration}</strong><small>{aircraft?.aircraft.model}</small></td><td>{plan.weeklyFlights}× weekly</td><td>{plan.departureTime} UTC</td><td>{plan.demand}/100</td><td><span>Active</span></td></tr>; })}</tbody></table></div> : <div className="route-empty"><MapPin /><h3>No routes operating</h3><p>Research a destination, assign a ready aircraft and secure airport slots to launch your first service.</p><Button onClick={() => setSection("planner")}>Open route planner</Button></div>}
      </article>
    </>}

    {section === "planner" && <div className="route-planner-grid">
      <article className="panel route-planner-form"><div className="panel-heading compact"><div><span className="panel-eyebrow">DESTINATION RESEARCH</span><h2>Build a route proposal</h2></div></div>
        <label className="route-field"><span>DESTINATION AIRPORT</span><div className="route-search"><Search /><input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim().length < 2) setResults([]); }} placeholder="Search city, airport, IATA or ICAO" />{searching && <i />}</div></label>
        {query.trim().length >= 2 && results.length > 0 && <div className="route-search-results">{results.map((hub) => <button type="button" key={`${hub.code}-${hub.icao}`} onClick={() => chooseDestination(hub)}><b>{hub.code}</b><span><strong>{hub.city}</strong><small>{hub.name} · {hub.country}</small></span><em>{hub.slotPressure} slot pressure</em></button>)}</div>}
        {query.trim().length >= 2 && results.length === 0 && <div className="route-search-feedback">{searching || searchedQuery !== query.trim() ? "Searching the worldwide airport catalogue…" : searchFailed ? "Airport search could not load. Please try again." : "No matching commercial airport found. Try an IATA code, city or airport name."}</div>}
        {destination && <div className="selected-destination"><b>{destination.code}</b><span><strong>{destination.name}</strong><small>{destination.city}, {destination.country}</small></span><button onClick={() => setDestination(null)}>Change</button></div>}
        <div className="route-form-grid">
          <label className="route-field"><span>AIRCRAFT</span><select value={aircraftId} onChange={(event) => setAircraftId(event.target.value)}><option value="">Select operational aircraft</option>{readyAircraft.map((item) => <option key={item.id} value={item.id}>{item.registration} · {item.aircraft.model} · {item.aircraft.range.toLocaleString()} km</option>)}</select><small>{readyAircraft.length ? "Only inducted, parked aircraft are shown." : "Complete aircraft induction before route assignment."}</small></label>
          <label className="route-field"><span>WEEKLY DEPARTURES</span><input type="number" min="1" max="21" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} /></label>
          <label className="route-field"><span>ONE-WAY BASE FARE</span><input type="number" min="1" value={fare} onChange={(event) => setFare(Number(event.target.value))} /></label>
          <label className="route-field"><span>DEPARTURE (UTC)</span><input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} /></label>
        </div>
        <div className="route-days"><span>OPERATING DAYS</span><div>{DAYS.map((day, index) => <button key={day} className={days.includes(index) ? "active" : ""} onClick={() => setDays((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])}>{day}</button>)}</div></div>
        <div className="route-submit"><p><CalendarClock /> Slot coordination normally responds through your inbox within one game day.</p><Button disabled={!destination || !aircraftId || !days.length} onClick={submit}><Send /> Submit slot application</Button></div>
      </article>
      <aside className="panel route-analysis"><div><span className="panel-eyebrow">MARKET ANALYSIS</span><h2>{destination ? `${game.hub.code}–${destination.code}` : "Select a destination"}</h2><p>Planning estimates are simulation values derived from airport scale, market demand and slot pressure.</p></div>
        {analysis ? <><dl><div><dt>Great-circle distance</dt><dd>{analysis.distance.toLocaleString()} km</dd></div><div><dt>Demand index</dt><dd>{analysis.demand}/100</dd></div><div><dt>Competition</dt><dd>{analysis.competition}</dd></div><div><dt>Suggested fare</dt><dd>{analysis.suggestedFare.toLocaleString()}</dd></div><div><dt>Slot pressure</dt><dd>{destination?.slotPressure}</dd></div><div><dt>Available capacity</dt><dd>{destination?.availableSlotsPercent ?? "Modelled"}{destination?.availableSlotsPercent != null ? "%" : ""}</dd></div></dl><div className="route-viability"><TrendingUp /><span><strong>{analysis.demand >= 75 ? "Strong market potential" : analysis.demand >= 55 ? "Balanced opportunity" : "Developing market"}</strong><small>Final performance depends on fare, frequency, aircraft capacity and competition.</small></span></div></> : <div className="route-analysis-empty"><Search /><span>Search the worldwide airport catalogue to compare distance, demand, competition and slots.</span></div>}
      </aside>
    </div>}

    {section === "applications" && <article className="panel route-applications"><div className="panel-heading compact"><div><span className="panel-eyebrow">AIRPORT COORDINATION</span><h2>Slot applications and launches</h2></div></div>
      {game.routePlans.length ? game.routePlans.map((plan) => { const application = game.slotApplications.find((item) => item.routePlanId === plan.id); const aircraft = game.fleet.find((item) => item.id === plan.aircraftId); return <div className="route-application-row" key={plan.id}><div className="route-pair"><b>{plan.from}</b><ArrowRight /><b>{plan.destination.code}</b></div><div><strong>{plan.destination.name}</strong><small>{aircraft?.registration} · {plan.weeklyFlights}× weekly · {plan.departureTime} UTC</small></div><div><span className={`route-plan-status ${plan.status}`}>{plan.status.replace("-", " ")}</span><small>{application?.status === "pending" ? `Decision ${new Date(application.decisionAt).toLocaleString("en-ZA", { timeZone: "UTC" })}` : application?.offeredTime ? `Offered ${application.offeredTime} UTC` : "See executive inbox"}</small></div>{plan.status === "active" ? <CheckCircle2 /> : <CalendarClock />}</div>; }) : <div className="route-empty"><CalendarClock /><h3>No slot applications</h3><p>Completed route proposals will be tracked here from submission through launch.</p><Button onClick={() => setSection("planner")}>Plan a route</Button></div>}
    </article>}
  </section>;
}
