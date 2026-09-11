"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Clock3, MapPin, PauseCircle, Plane, PlayCircle, Search, Send, TrendingUp } from "lucide-react";
import { RouteMap } from "@/components/game/command-centre";
import { Button } from "@/components/ui/button";
import { calculateBlockTime, searchAirports } from "@/lib/airport-system";
import { blockMinutes, calculateRotationTimes, routeMarketAnalysis, validateRouteSchedule, type RoutePlanInput } from "@/lib/game/routes";
import type { Hub } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Section = "overview" | "planner" | "timetable" | "applications";

export function NetworkView({ game, onSubmitSlotApplication, onSetRouteSuspended }: { game: AirlineState; onSubmitSlotApplication: (input: RoutePlanInput) => boolean; onSetRouteSuspended: (routePlanId: string, suspended: boolean) => void }) {
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
  const [returnDepartureTime, setReturnDepartureTime] = useState("12:00");
  const [turnaroundMinutes, setTurnaroundMinutes] = useState(45);
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [timetableFilter, setTimetableFilter] = useState("all");
  const publishedRoutes = game.routePlans.filter((plan) => plan.status === "active" || plan.status === "suspended");
  const activeRoutes = publishedRoutes.filter((plan) => plan.status === "active");
  const readyAircraft = game.fleet.filter((item) => ["parked", "active"].includes(item.status) && item.inductionStage === "complete");
  const analysis = useMemo(() => destination ? routeMarketAnalysis(game.hub, destination) : null, [destination, game.hub]);
  const selectedAircraft = game.fleet.find((item) => item.id === aircraftId);
  const routeBlockTime = analysis && selectedAircraft ? calculateRotationTimes(
    departureTime,
    returnDepartureTime,
    blockMinutes(calculateBlockTime(analysis.distance, selectedAircraft.aircraft.cruiseSpeed, destination?.slotPressure ?? "Medium")),
    selectedAircraft.aircraft.turnaround,
  ) : null;
  const draftInput = destination ? { destination, aircraftId, weeklyFlights: frequency, baseFare: fare, departureTime, returnDepartureTime, turnaroundMinutes, operatingDays: days } : null;
  const scheduleIssues = draftInput && aircraftId ? validateRouteSchedule(game, draftInput) : [];
  const timetableRoutes = publishedRoutes.filter((plan) => {
    if (timetableFilter === "all") return true;
    if (timetableFilter.startsWith("aircraft:")) return plan.aircraftId === timetableFilter.slice(9);
    if (timetableFilter.startsWith("route:")) return plan.id === timetableFilter.slice(6);
    if (timetableFilter.startsWith("airport:")) return plan.destination.code === timetableFilter.slice(8);
    return true;
  });
  const timetableAircraft = game.fleet.filter((item) =>
    item.inductionStage === "complete" &&
    (timetableFilter === "all" || timetableRoutes.some((plan) => plan.aircraftId === item.id)),
  );
  const destinationCodes = [...new Set(publishedRoutes.map((plan) => plan.destination.code))].sort();
  const currentDate = new Date(game.gameDateTime);
  const weekStart = Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - ((currentDate.getUTCDay() + 6) % 7));

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
    const submitted = onSubmitSlotApplication({ destination, aircraftId, weeklyFlights: frequency, baseFare: fare, departureTime, returnDepartureTime, turnaroundMinutes, operatingDays: days });
    if (submitted) setSection("applications");
  };

  return <section className="route-workspace">
    <nav className="route-workspace-nav">
      <button className={section === "overview" ? "active" : ""} onClick={() => setSection("overview")}>Network overview</button>
      <button className={section === "planner" ? "active" : ""} onClick={() => setSection("planner")}>Plan a route</button>
      <button className={section === "timetable" ? "active" : ""} onClick={() => setSection("timetable")}>Weekly timetable</button>
      <button className={section === "applications" ? "active" : ""} onClick={() => setSection("applications")}>Slots & launches <span>{game.slotApplications.filter((item) => item.status === "pending").length}</span></button>
    </nav>

    {section === "overview" && <>
      <article className="panel module-hero"><div className="panel-heading"><div><span className="panel-eyebrow">NETWORK CONTROL</span><h2>{game.hub.city} hub network</h2></div><span className="status-on-time">{activeRoutes.length} ACTIVE {activeRoutes.length === 1 ? "ROUTE" : "ROUTES"}</span></div><RouteMap game={game} /></article>
      <article className="panel route-register"><div className="panel-heading compact"><div><span className="panel-eyebrow">OPERATING NETWORK</span><h2>Route register</h2></div><Button onClick={() => setSection("planner")}><Plane /> Plan new route</Button></div>
        {publishedRoutes.length ? <div className="route-register-table"><table><thead><tr><th>Route</th><th>Aircraft</th><th>Flights</th><th>Rotation</th><th>Status</th><th>Control</th></tr></thead><tbody>{publishedRoutes.map((plan) => { const aircraft = game.fleet.find((item) => item.id === plan.aircraftId); return <tr key={plan.id}><td><strong>{plan.from} <ArrowRight /> {plan.destination.code}</strong><small>{plan.destination.city} · {plan.distance.toLocaleString()} km</small></td><td><strong>{aircraft?.registration}</strong><small>{aircraft?.aircraft.model}</small></td><td><strong>{plan.outboundFlightNumber} / {plan.returnFlightNumber}</strong><small>{plan.weeklyFlights} rotations weekly</small></td><td><strong>{plan.departureTime} / {plan.returnDepartureTime}</strong><small>UTC departures</small></td><td><span className={plan.status}>{plan.status}</span></td><td><Button size="sm" variant="outline" onClick={() => onSetRouteSuspended(plan.id, plan.status === "active")}>{plan.status === "active" ? <PauseCircle /> : <PlayCircle />}{plan.status === "active" ? "Suspend" : "Restore"}</Button></td></tr>; })}</tbody></table></div> : <div className="route-empty"><MapPin /><h3>No routes operating</h3><p>Research a destination, build a return rotation and secure airport slots to launch your first service.</p><Button onClick={() => setSection("planner")}>Open route planner</Button></div>}
      </article>
    </>}

    {section === "planner" && <div className="route-planner-grid">
      <article className="panel route-planner-form"><div className="panel-heading compact"><div><span className="panel-eyebrow">DESTINATION RESEARCH</span><h2>Build a route proposal</h2></div></div>
        <label className="route-field"><span>DESTINATION AIRPORT</span><div className="route-search"><Search /><input value={query} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim().length < 2) setResults([]); }} placeholder="Search city, airport, IATA or ICAO" />{searching && <i />}</div></label>
        {query.trim().length >= 2 && results.length > 0 && <div className="route-search-results">{results.map((hub) => <button type="button" key={`${hub.code}-${hub.icao}`} onClick={() => chooseDestination(hub)}><b>{hub.code}</b><span><strong>{hub.city}</strong><small>{hub.name} · {hub.country}</small></span><em>{hub.slotPressure} slot pressure</em></button>)}</div>}
        {query.trim().length >= 2 && results.length === 0 && <div className="route-search-feedback">{searching || searchedQuery !== query.trim() ? "Searching the worldwide airport catalogue…" : searchFailed ? "Airport search could not load. Please try again." : "No matching commercial airport found. Try an IATA code, city or airport name."}</div>}
        {destination && <div className="selected-destination"><b>{destination.code}</b><span><strong>{destination.name}</strong><small>{destination.city}, {destination.country}</small></span><button onClick={() => setDestination(null)}>Change</button></div>}
        <div className="route-form-grid">
          <label className="route-field"><span>AIRCRAFT</span><select value={aircraftId} onChange={(event) => { const nextId = event.target.value; const item = game.fleet.find((entry) => entry.id === nextId); setAircraftId(nextId); if (item) setTurnaroundMinutes(Math.max(45, item.aircraft.turnaround)); }}><option value="">Select operational aircraft</option>{readyAircraft.map((item) => <option key={item.id} value={item.id}>{item.registration} · {item.aircraft.model} · {item.aircraft.range.toLocaleString()} km</option>)}</select><small>{readyAircraft.length ? "Inducted aircraft are shown; existing rotations are checked automatically." : "Complete aircraft induction before route assignment."}</small></label>
          <label className="route-field"><span>WEEKLY ROTATIONS</span><input type="number" value={frequency} readOnly /><small>One return rotation on each selected day.</small></label>
          <label className="route-field"><span>ONE-WAY BASE FARE</span><input type="number" min="1" value={fare} onChange={(event) => setFare(Number(event.target.value))} /></label>
          <label className="route-field"><span>{game.hub.code} DEPARTURE (UTC)</span><input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} /></label>
          <label className="route-field"><span>{destination?.code ?? "DESTINATION"} RETURN DEPARTURE (UTC)</span><input type="time" value={returnDepartureTime} onChange={(event) => setReturnDepartureTime(event.target.value)} /></label>
          <label className="route-field"><span>DESTINATION TURNAROUND</span><input type="number" min={selectedAircraft?.aircraft.turnaround ?? 20} step="5" value={turnaroundMinutes} onChange={(event) => setTurnaroundMinutes(Number(event.target.value))} /><small>Aircraft minimum: {selectedAircraft?.aircraft.turnaround ?? "—"} minutes.</small></label>
        </div>
        <div className="route-days"><span>OPERATING DAYS</span><div>{DAYS.map((day, index) => <button type="button" key={day} className={days.includes(index) ? "active" : ""} onClick={() => setDays((current) => { const next = current.includes(index) ? current.filter((item) => item !== index) : [...current, index]; setFrequency(next.length); return next; })}>{day}</button>)}</div></div>
        {routeBlockTime && <div className="rotation-preview"><div><span>OUTBOUND</span><strong>{game.hub.code} {routeBlockTime.outboundDeparture} → {destination?.code} {routeBlockTime.outboundArrival}</strong></div><ArrowRight /><div><span>RETURN</span><strong>{destination?.code} {routeBlockTime.returnDeparture} → {game.hub.code} {routeBlockTime.returnArrival}</strong></div><small>Aircraft available {routeBlockTime.nextAvailable} UTC{routeBlockTime.crossesMidnight ? " next day" : ""}</small></div>}
        {scheduleIssues.length > 0 && <div className="schedule-issues">{scheduleIssues.map((issue) => <p key={`${issue.field}-${issue.message}`}><AlertTriangle />{issue.message}</p>)}</div>}
        <div className="route-submit"><p><CalendarClock /> One request secures departure and arrival slots in both directions.</p><Button disabled={!destination || !aircraftId || !days.length || scheduleIssues.length > 0} onClick={submit}><Send /> Submit rotation for slots</Button></div>
      </article>
      <aside className="panel route-analysis"><div><span className="panel-eyebrow">MARKET ANALYSIS</span><h2>{destination ? `${game.hub.code}–${destination.code}` : "Select a destination"}</h2><p>Planning estimates are simulation values derived from airport scale, market demand and slot pressure.</p></div>
        {analysis ? <><dl><div><dt>Great-circle distance</dt><dd>{analysis.distance.toLocaleString()} km</dd></div><div><dt>Demand index</dt><dd>{analysis.demand}/100</dd></div><div><dt>Competition</dt><dd>{analysis.competition}</dd></div><div><dt>Suggested fare</dt><dd>{analysis.suggestedFare.toLocaleString()}</dd></div><div><dt>Slot pressure</dt><dd>{destination?.slotPressure}</dd></div><div><dt>Available capacity</dt><dd>{destination?.availableSlotsPercent ?? "Modelled"}{destination?.availableSlotsPercent != null ? "%" : ""}</dd></div></dl><div className="route-viability"><TrendingUp /><span><strong>{analysis.demand >= 75 ? "Strong market potential" : analysis.demand >= 55 ? "Balanced opportunity" : "Developing market"}</strong><small>Final performance depends on fare, frequency, aircraft capacity and competition.</small></span></div></> : <div className="route-analysis-empty"><Search /><span>Search the worldwide airport catalogue to compare distance, demand, competition and slots.</span></div>}
      </aside>
    </div>}

    {section === "timetable" && <article className="panel weekly-timetable">
      <div className="panel-heading compact timetable-heading"><div><span className="panel-eyebrow">OPERATIONS SCHEDULE</span><h2>Monday–Sunday aircraft timetable</h2></div><label><span>FILTER SCHEDULE</span><select value={timetableFilter} onChange={(event) => setTimetableFilter(event.target.value)}><option value="all">All aircraft and routes</option><optgroup label="Aircraft">{game.fleet.filter((item) => item.inductionStage === "complete").map((item) => <option key={item.id} value={`aircraft:${item.id}`}>{item.registration} · {item.aircraft.model}</option>)}</optgroup><optgroup label="Routes">{publishedRoutes.map((plan) => <option key={plan.id} value={`route:${plan.id}`}>{plan.from}–{plan.destination.code} · {plan.outboundFlightNumber}/{plan.returnFlightNumber}</option>)}</optgroup><optgroup label="Airports">{destinationCodes.map((code) => <option key={code} value={`airport:${code}`}>{code}</option>)}</optgroup></select></label></div>
      {timetableAircraft.length ? <div className="timetable-scroll"><div className="timetable-grid timetable-header"><div>AIRCRAFT</div>{DAYS.map((day, index) => { const date = new Date(weekStart + index * 86_400_000); return <div key={day}><strong>{day}</strong><small>{date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", timeZone: "UTC" })}</small></div>; })}</div>
        {timetableAircraft.map((aircraft) => <div className="timetable-grid timetable-row" key={aircraft.id}><div className="timetable-aircraft"><Plane /><span><strong>{aircraft.registration}</strong><small>{aircraft.aircraft.model}</small></span></div>{DAYS.map((day, index) => { const cellStart = weekStart + index * 86_400_000; const cellEnd = cellStart + 86_400_000; const task = game.fleetTasks.find((item) => item.aircraftId === aircraft.id && item.status === "active" && Date.parse(item.startedAt) < cellEnd && Date.parse(item.completesAt) > cellStart); const rotations = timetableRoutes.filter((plan) => plan.aircraftId === aircraft.id && plan.operatingDays.includes(index)); return <div className="timetable-cell" key={`${aircraft.id}-${day}`}>{task ? <div className="timetable-maintenance"><AlertTriangle /><strong>{task.label}</strong><small>Unavailable</small></div> : rotations.length ? rotations.map((plan) => <div key={plan.id} className={`timetable-rotation ${plan.status}`}><span><b>{plan.outboundFlightNumber}</b> {plan.departureTime} {plan.from}→{plan.destination.code}</span><span><b>{plan.returnFlightNumber}</b> {plan.returnDepartureTime} {plan.destination.code}→{plan.from}</span>{plan.status === "suspended" && <em>Suspended</em>}</div>) : <span className="timetable-idle">Available</span>}</div>; })}</div>)}
      </div> : <div className="route-empty"><Clock3 /><h3>No timetable to display</h3><p>Induct an aircraft and publish a route to create the weekly operating schedule.</p><Button onClick={() => setSection("planner")}>Plan a route</Button></div>}
    </article>}

    {section === "applications" && <article className="panel route-applications"><div className="panel-heading compact"><div><span className="panel-eyebrow">AIRPORT COORDINATION</span><h2>Slot applications and launches</h2></div></div>
      {game.routePlans.length ? game.routePlans.map((plan) => { const application = game.slotApplications.find((item) => item.routePlanId === plan.id); const aircraft = game.fleet.find((item) => item.id === plan.aircraftId); return <div className="route-application-row" key={plan.id}><div className="route-pair"><b>{plan.from}</b><ArrowRight /><b>{plan.destination.code}</b></div><div><strong>{plan.outboundFlightNumber} / {plan.returnFlightNumber} · {plan.destination.name}</strong><small>{aircraft?.registration} · {plan.weeklyFlights} rotations · outbound {plan.departureTime} / return {plan.returnDepartureTime} UTC</small></div><div><span className={`route-plan-status ${plan.status}`}>{plan.status.replace("-", " ")}</span><small>{application?.status === "pending" ? `Decision ${new Date(application.decisionAt).toLocaleString("en-ZA", { timeZone: "UTC" })}` : application?.offeredTime ? `Offered ${application.offeredTime} / ${application.offeredReturnTime} UTC` : "See executive inbox"}</small></div>{plan.status === "active" ? <CheckCircle2 /> : <CalendarClock />}</div>; }) : <div className="route-empty"><CalendarClock /><h3>No slot applications</h3><p>Completed route proposals will be tracked here from submission through launch.</p><Button onClick={() => setSection("planner")}>Plan a route</Button></div>}
    </article>}
  </section>;
}
