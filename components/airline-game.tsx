"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, BarChart3, Building2, CalendarDays, Check,
  ChevronRight, CircleDollarSign, Clock3, CloudSun, Fuel, Gauge, Globe2,
  FilePlus2, Gamepad2, LayoutDashboard, LogOut, Menu, Monitor, Plane,
  PlaneTakeoff, Play, Route, Settings, ShieldCheck, Sparkles, TrendingUp,
  Users, Volume2, WalletCards, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { aircraft, formatMoney, hubs, routeSeeds, strategies, type Aircraft, type Hub, type RouteSeed, type Strategy } from "@/lib/game-data";

type View = "overview" | "network" | "fleet" | "finance";

type AirlineState = {
  airlineName: string; iata: string; icao: string; hub: Hub; strategy: Strategy;
  aircraft: Aircraft; route: RouteSeed; week: number; cash: number;
  reputation: number; loadFactor: number; onTime: number; aircraftCondition: number;
  fuelIndex: number; lastRevenue: number; lastCosts: number; lastProfit: number; passengers: number;
};

const STORAGE_KEY = "airline-executive-career-v1";
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const navItems = [
  { id: "overview" as View, label: "Command centre", icon: LayoutDashboard },
  { id: "network" as View, label: "Network", icon: Route },
  { id: "fleet" as View, label: "Fleet", icon: Plane },
  { id: "finance" as View, label: "Finance", icon: BarChart3 },
];

function OpeningMenu({ game, onContinue, onNewCareer, onExit }: { game: AirlineState | null; onContinue: () => void; onNewCareer: () => void; onExit: () => void }) {
  const [music, setMusic] = useState(true);
  const [effects, setEffects] = useState(true);
  const careerDate = game ? new Date(2026, 8, 6 + (game.week - 1) * 7).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return <main className="opening-screen" style={{ "--opening-background": `url('${PUBLIC_BASE_PATH}/opening-airport-dusk.png')` } as React.CSSProperties}>
    <div className="opening-backdrop" />
    <div className="opening-shade" />
    <header className="opening-header"><Brand /><div className="opening-edition"><span>FOUNDER EDITION</span><b>BUILD 0.1.0</b></div></header>
    <section className="opening-menu" aria-label="Main menu">
      <div className="opening-title"><span>AIRLINE MANAGEMENT SIMULATION</span><h1>Your airline.<br/>Your legacy.</h1><p>Build the network. Master the operation. Lead from the front.</p></div>
      <div className="menu-actions">
        <Button className="menu-primary" disabled={!game} onClick={onContinue}><Play/><span><b>Continue career</b><small>{game ? `${game.airlineName} · Week ${game.week}` : "No active career"}</small></span><ChevronRight/></Button>
        <Button variant="ghost" className="menu-secondary" onClick={onNewCareer}><FilePlus2/><span><b>New career</b><small>Build an airline from the ground up</small></span><ChevronRight/></Button>
        <Dialog><DialogTrigger asChild><Button variant="ghost" className="menu-secondary compact"><Settings/><span><b>Settings</b></span><ChevronRight/></Button></DialogTrigger><DialogContent className="opening-dialog"><DialogHeader><DialogTitle>Game settings</DialogTitle><DialogDescription>Adjust the opening experience. More game settings will be added as the simulation expands.</DialogDescription></DialogHeader><div className="settings-list"><div><span><Volume2/>Menu music</span><Switch checked={music} onCheckedChange={setMusic}/></div><div><span><Gamepad2/>Interface sounds</span><Switch checked={effects} onCheckedChange={setEffects}/></div><div><span><Monitor/>Display mode</span><b>Automatic</b></div></div></DialogContent></Dialog>
        <Button variant="ghost" className="menu-secondary compact quiet" onClick={onExit}><LogOut/><span><b>Exit game</b></span></Button>
      </div>
    </section>
    {game && <aside className="career-card"><div className="career-card-top"><span>ACTIVE CAREER</span><i/></div><div className="career-airline"><b>{game.iata}</b><div><strong>{game.airlineName}</strong><small>{game.hub.city} · {game.strategy.name}</small></div></div><dl><div><dt>Game date</dt><dd>{careerDate}</dd></div><div><dt>Cash</dt><dd>{formatMoney(game.cash)}</dd></div><div><dt>Fleet</dt><dd>1 aircraft</dd></div><div><dt>Network</dt><dd>1 route</dd></div></dl><button onClick={onContinue}>Open command centre <ArrowRight/></button></aside>}
    <footer className="opening-footer"><span>© 2026 AIRLINE EXECUTIVE</span><span>AN EARLY PLAYABLE FOUNDATION</span></footer>
  </main>;
}

function FounderSetup({ onLaunch, onBack }: { onLaunch: (game: AirlineState) => void; onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Aurelia Air");
  const [iata, setIata] = useState("AU");
  const [icao, setIcao] = useState("AUR");
  const [hubCode, setHubCode] = useState("JNB");
  const [strategyId, setStrategyId] = useState<Strategy["id"]>("network");
  const [aircraftModel, setAircraftModel] = useState("Embraer E195-E2");
  const [routeCode, setRouteCode] = useState("CPT");
  const hub = hubs.find((item) => item.code === hubCode) ?? hubs[0];
  const strategy = strategies.find((item) => item.id === strategyId) ?? strategies[1];
  const selectedAircraft = aircraft.find((item) => item.model === aircraftModel) ?? aircraft[1];
  const availableRoutes = routeSeeds[hub.code];
  const route = availableRoutes.find((item) => item.to === routeCode) ?? availableRoutes[0];

  useEffect(() => setRouteCode(routeSeeds[hubCode][0].to), [hubCode]);

  const launch = () => {
    const initialCash = strategy.capital - selectedAircraft.monthlyLease * 3 - 4_800_000;
    const initialLoad = Math.round(Math.min(84, route.demand * 0.76 * strategy.demandMultiplier));
    const sectors = route.weeklyFlights * 2;
    const passengers = Math.round(sectors * selectedAircraft.seats * (initialLoad / 100));
    const revenue = passengers * route.baseFare * strategy.fareMultiplier;
    const variable = sectors * route.distance * selectedAircraft.fuelBurn * 10.8;
    const costs = variable + selectedAircraft.monthlyLease / 4.33 + sectors * 31_000 + 690_000;
    onLaunch({ airlineName: name.trim() || "Aurelia Air", iata: iata.toUpperCase(), icao: icao.toUpperCase(), hub, strategy, aircraft: selectedAircraft, route, week: 1, cash: initialCash, reputation: 50, loadFactor: initialLoad, onTime: 91.4, aircraftCondition: 100, fuelIndex: 104.6, lastRevenue: revenue, lastCosts: costs, lastProfit: revenue - costs, passengers });
  };

  return <div className="founder-shell">
    <aside className="founder-aside">
      <Brand />
      <div className="founder-copy"><p className="eyebrow">NEW CAREER · 2026</p><h1>Build an airline the world remembers.</h1><p>Every seat, slot and decision matters. Establish your headquarters, define the business and put your first aircraft into service.</p></div>
      <div className="setup-steps">{[
        [1, "Corporate identity", "Name, codes and headquarters"],
        [2, "Operating model", "Strategy and first aircraft"],
        [3, "Launch network", "Open your first route"],
      ].map(([number, title, detail]) => <button key={number} className={`setup-step ${step === number ? "active" : ""} ${step > Number(number) ? "complete" : ""}`} onClick={() => step > Number(number) && setStep(Number(number))}><span>{step > Number(number) ? <Check /> : number}</span><div><strong>{title}</strong><small>{detail}</small></div></button>)}</div>
      <div className="founder-footer"><ShieldCheck /> Career data saves automatically on this device</div>
    </aside>
    <main className="setup-panel">
      <div className="setup-progress"><span style={{ width: `${(step / 3) * 100}%` }} /></div>
      {step === 1 && <section className="setup-content">
        <div className="section-number">01 / 03</div><h2>Name your airline</h2><p className="setup-lead">Create the identity that passengers, investors and regulators will know.</p>
        <div className="form-grid"><div className="field full"><Label htmlFor="airline-name">Airline name</Label><Input id="airline-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={32} /></div><div className="field"><Label htmlFor="iata">IATA code</Label><Input id="iata" value={iata} onChange={(e) => setIata(e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase())} maxLength={2} /></div><div className="field"><Label htmlFor="icao">ICAO code</Label><Input id="icao" value={icao} onChange={(e) => setIcao(e.target.value.replace(/[^a-z]/gi, "").toUpperCase())} maxLength={3} /></div><div className="field full"><Label>Headquarters & primary hub</Label><Select value={hubCode} onValueChange={setHubCode}><SelectTrigger className="select-control"><SelectValue /></SelectTrigger><SelectContent>{hubs.map((item) => <SelectItem key={item.code} value={item.code}>{item.code} · {item.city}, {item.country}</SelectItem>)}</SelectContent></Select></div></div>
        <div className="hub-fact-row"><div><span>MARKET</span><strong>{hub.market}</strong></div><div><span>SLOT PRESSURE</span><strong>{hub.slotPressure}</strong></div><div><span>LONGEST RUNWAY</span><strong>{hub.runway}</strong></div></div>
      </section>}
      {step === 2 && <section className="setup-content wide">
        <div className="section-number">02 / 03</div><h2>Choose your operating model</h2><p className="setup-lead">Your strategy influences available capital, passenger demand and ticket yield.</p>
        <div className="choice-grid strategy-grid">{strategies.map((item) => <button key={item.id} onClick={() => setStrategyId(item.id)} className={`choice-card ${strategyId === item.id ? "selected" : ""}`}><div className="choice-check">{strategyId === item.id && <Check />}</div><span className="card-kicker">{formatMoney(item.capital)} CAPITAL</span><h3>{item.name}</h3><p>{item.description}</p><div className="choice-metrics"><span>Yield <b>{Math.round(item.fareMultiplier * 100)}%</b></span><span>Demand <b>{Math.round(item.demandMultiplier * 100)}%</b></span></div></button>)}</div>
        <div className="subhead"><div><span>FIRST AIRCRAFT</span><strong>Operating lease · 36 months</strong></div><Fuel /></div>
        <div className="aircraft-choice-list">{aircraft.map((item) => <button key={item.model} className={`aircraft-choice ${aircraftModel === item.model ? "selected" : ""}`} onClick={() => setAircraftModel(item.model)}><span className="aircraft-radio"/><div className="plane-silhouette"><Plane /></div><div className="aircraft-title"><strong>{item.model}</strong><span>{item.family}</span></div><div><small>SEATS</small><strong>{item.seats}</strong></div><div><small>RANGE</small><strong>{item.range.toLocaleString()} km</strong></div><div><small>LEASE / MO</small><strong>{formatMoney(item.monthlyLease)}</strong></div></button>)}</div>
      </section>}
      {step === 3 && <section className="setup-content wide">
        <div className="section-number">03 / 03</div><h2>Open your first route</h2><p className="setup-lead">Select the market that will define your airline’s opening chapter.</p>
        <div className="launch-layout"><div className="route-options">{availableRoutes.map((item) => <button key={item.to} className={`route-option ${routeCode === item.to ? "selected" : ""}`} onClick={() => setRouteCode(item.to)}><span className="route-code">{hub.code}<ArrowRight />{item.to}</span><div><strong>{item.city}</strong><small>{item.distance.toLocaleString()} km · {item.blockTime}</small></div><div className="demand-meter"><span>DEMAND</span><b>{item.demand}</b></div></button>)}</div><div className="launch-summary"><p className="eyebrow">LAUNCH BRIEF</p><h3>{name || "Your airline"}</h3><div className="summary-route"><span>{hub.code}</span><div><Plane /><i /></div><span>{route.to}</span></div><dl><div><dt>Aircraft</dt><dd>{selectedAircraft.model}</dd></div><div><dt>Weekly rotations</dt><dd>{route.weeklyFlights}</dd></div><div><dt>Opening cash</dt><dd>{formatMoney(strategy.capital - selectedAircraft.monthlyLease * 3 - 4_800_000)}</dd></div><div><dt>Expected load factor</dt><dd>{Math.round(Math.min(84, route.demand * 0.76 * strategy.demandMultiplier))}%</dd></div></dl></div></div>
      </section>}
      <footer className="setup-actions"><Button variant="ghost" onClick={() => step === 1 ? onBack() : setStep(step - 1)}>{step === 1 ? "Main menu" : "Back"}</Button>{step < 3 ? <Button className="gold-button" onClick={() => setStep(step + 1)} disabled={!name.trim() || iata.length !== 2 || icao.length !== 3}>Continue <ArrowRight /></Button> : <Button className="gold-button" onClick={launch}>Launch airline <PlaneTakeoff /></Button>}</footer>
    </main>
  </div>;
}

function Brand() {
  return <div className="brand-lockup"><div className="brand-mark"><PlaneTakeoff /></div><div><strong>AIRLINE</strong><span>EXECUTIVE</span></div></div>;
}

function MetricCard({ label, value, change, icon: Icon, tone = "default" }: { label: string; value: string; change: string; icon: typeof Activity; tone?: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-head"><span>{label}</span><Icon /></div><strong>{value}</strong><small>{change}</small></article>;
}

function RouteMap({ game }: { game: AirlineState }) {
  return <div className="network-map" aria-label={`Route map from ${game.hub.code} to ${game.route.to}`}><div className="map-grid"/><div className="map-orbit orbit-one"/><div className="map-orbit orbit-two"/><div className="route-arc" style={{ left: `${Math.min(game.hub.coordinates.x, game.route.coordinates.x)}%`, top: `${Math.min(game.hub.coordinates.y, game.route.coordinates.y)}%`, width: `${Math.max(12, Math.abs(game.hub.coordinates.x - game.route.coordinates.x))}%`, height: `${Math.max(10, Math.abs(game.hub.coordinates.y - game.route.coordinates.y))}%` }}/><div className="map-node hub-node" style={{ left: `${game.hub.coordinates.x}%`, top: `${game.hub.coordinates.y}%` }}><i/><span>{game.hub.code}</span></div><div className="map-node destination-node" style={{ left: `${game.route.coordinates.x}%`, top: `${game.route.coordinates.y}%` }}><i/><span>{game.route.to}</span></div><div className="map-flight" style={{ left: `${(game.hub.coordinates.x + game.route.coordinates.x) / 2}%`, top: `${(game.hub.coordinates.y + game.route.coordinates.y) / 2 - 4}%` }}><Plane /></div><div className="map-label north-america">NORTH AMERICA</div><div className="map-label europe">EUROPE</div><div className="map-label africa">AFRICA</div><div className="map-label asia">ASIA PACIFIC</div><div className="weather-chip"><CloudSun/><span>Hub weather</span><b>22°C</b></div></div>;
}

function Overview({ game }: { game: AirlineState }) {
  return <><section className="metric-grid"><MetricCard label="Cash position" value={formatMoney(game.cash)} change={`${game.lastProfit >= 0 ? "+" : ""}${formatMoney(game.lastProfit)} this week`} icon={WalletCards} tone={game.lastProfit >= 0 ? "positive" : "warning"}/><MetricCard label="Weekly passengers" value={game.passengers.toLocaleString()} change={`${game.loadFactor}% network load factor`} icon={Users}/><MetricCard label="On-time performance" value={`${game.onTime.toFixed(1)}%`} change="Target · 90.0%" icon={Clock3} tone={game.onTime >= 90 ? "positive" : "warning"}/><MetricCard label="Airline reputation" value={`${game.reputation}/100`} change={game.reputation >= 55 ? "Trusted regional operator" : "Building market awareness"} icon={Sparkles}/></section>
    <section className="command-grid"><article className="panel network-panel"><div className="panel-heading"><div><span className="panel-eyebrow">LIVE NETWORK</span><h2>{game.hub.code} operations</h2></div><div className="live-pill"><i/> LIVE</div></div><RouteMap game={game}/><div className="route-live-row"><div className="route-flight-no"><span>{game.iata} 101</span><strong>{game.hub.code} <ArrowRight/> {game.route.to}</strong></div><div><small>NEXT DEPARTURE</small><strong>14:35</strong></div><div><small>AIRCRAFT</small><strong>{game.aircraft.model}</strong></div><div><small>LOAD</small><strong>{game.loadFactor}%</strong></div><span className="status-on-time">ON TIME</span></div></article>
      <article className="panel brief-panel"><div className="panel-heading"><div><span className="panel-eyebrow">EXECUTIVE BRIEF</span><h2>What needs attention</h2></div><span className="brief-count">3</span></div><div className="brief-list"><button><span className="brief-icon fuel"><Fuel/></span><div><strong>Fuel market firming</strong><p>Jet fuel index is {game.fuelIndex.toFixed(1)}, increasing sector cost pressure.</p></div><ChevronRight/></button><button><span className="brief-icon blue"><TrendingUp/></span><div><strong>{game.route.to} demand is strengthening</strong><p>Forward bookings are tracking 6% above the opening forecast.</p></div><ChevronRight/></button><button><span className="brief-icon green"><ShieldCheck/></span><div><strong>Operations remain stable</strong><p>{game.aircraft.model} dispatch reliability is {game.aircraft.reliability}%.</p></div><ChevronRight/></button></div><div className="board-objective"><span>BOARD OBJECTIVE · Q1</span><div><strong>Reach 68% average load factor</strong><b>{game.loadFactor}%</b></div><Progress value={Math.min(100, game.loadFactor / 0.68)}/><small>Reward: R12m growth facility</small></div></article></section>
    <section className="bottom-grid"><article className="panel"><div className="panel-heading compact"><div><span className="panel-eyebrow">ROUTE PERFORMANCE</span><h2>Current schedule</h2></div></div><div className="route-table"><div className="table-head"><span>ROUTE</span><span>FREQUENCY</span><span>LOAD FACTOR</span><span>WEEKLY RESULT</span><span>STATUS</span></div><div className="table-row"><div><b>{game.hub.code}</b><ArrowRight/><b>{game.route.to}</b><small>{game.route.distance.toLocaleString()} km</small></div><span>{game.route.weeklyFlights}× weekly</span><span><i style={{ width: `${game.loadFactor}%` }}/><b>{game.loadFactor}%</b></span><strong className={game.lastProfit >= 0 ? "profit" : "loss"}>{formatMoney(game.lastProfit)}</strong><em>Operating</em></div></div></article>
      <article className="panel fleet-mini"><div className="panel-heading compact"><div><span className="panel-eyebrow">FLEET HEALTH</span><h2>Aircraft status</h2></div><span className="fleet-count">1 aircraft</span></div><div className="fleet-visual"><Plane/><div><span>{game.icao}-001</span><strong>{game.aircraft.model}</strong><small>At {game.hub.code} · Next sector in 2h 18m</small></div></div><div className="fleet-stats"><div><span>CONDITION</span><strong>{game.aircraftCondition.toFixed(1)}%</strong><Progress value={game.aircraftCondition}/></div><div><span>UTILISATION</span><strong>8.7h</strong><Progress value={73}/></div></div></article></section></>;
}

function NetworkView({ game }: { game: AirlineState }) {
  return <section className="module-grid"><article className="panel module-hero"><div className="panel-heading"><div><span className="panel-eyebrow">NETWORK PLANNING</span><h2>{game.hub.city} hub strategy</h2></div><span className="status-on-time">1 ACTIVE ROUTE</span></div><RouteMap game={game}/></article><article className="panel market-list"><div className="panel-heading compact"><div><span className="panel-eyebrow">MARKET SCREEN</span><h2>Expansion candidates</h2></div></div>{routeSeeds[game.hub.code].map((route) => <div className={`market-row ${route.to === game.route.to ? "active" : ""}`} key={route.to}><span className="airport-pair">{route.from}<ArrowRight/>{route.to}</span><div><strong>{route.city}</strong><small>{route.distance.toLocaleString()} km · {route.blockTime}</small></div><div className="market-score"><span>DEMAND</span><b>{route.demand}</b></div><Button variant={route.to === game.route.to ? "secondary" : "outline"} size="sm" disabled>{route.to === game.route.to ? "Operating" : "Research"}</Button></div>)}</article></section>;
}

function FleetView({ game }: { game: AirlineState }) {
  return <section className="module-grid"><article className="panel aircraft-detail"><div className="aircraft-banner"><div className="plane-large"><Plane/></div><div><span className="panel-eyebrow">{game.icao}-001 · ACTIVE</span><h2>{game.aircraft.model}</h2><p>{game.aircraft.family} · {game.aircraft.seats} seats · Delivered Aug 2026</p></div></div><div className="spec-grid"><div><span>RANGE</span><strong>{game.aircraft.range.toLocaleString()} km</strong></div><div><span>TURNAROUND</span><strong>{game.aircraft.turnaround} min</strong></div><div><span>RELIABILITY</span><strong>{game.aircraft.reliability}%</strong></div><div><span>LEASE / MONTH</span><strong>{formatMoney(game.aircraft.monthlyLease)}</strong></div></div></article><article className="panel"><div className="panel-heading compact"><div><span className="panel-eyebrow">ENGINEERING</span><h2>Technical condition</h2></div><span className="status-on-time">SERVICEABLE</span></div><div className="health-ring"><div style={{ "--health": `${game.aircraftCondition * 3.6}deg` } as React.CSSProperties}><span>{game.aircraftCondition.toFixed(1)}%</span><small>AIRFRAME</small></div></div><div className="maintenance-list"><div><span><Gauge/> A-check forecast</span><strong>184 flight hours</strong></div><div><span><ShieldCheck/> Open defects</span><strong>0 MEL items</strong></div><div><span><CalendarDays/> Next inspection</span><strong>28 Sep 2026</strong></div></div></article></section>;
}

function FinanceView({ game }: { game: AirlineState }) {
  const lines = [{ label: "Passenger revenue", value: game.lastRevenue, type: "income" }, { label: "Fuel & emissions", value: -(game.lastCosts * 0.34), type: "cost" }, { label: "Aircraft lease", value: -(game.aircraft.monthlyLease / 4.33), type: "cost" }, { label: "Crew & operations", value: -(game.lastCosts * 0.27), type: "cost" }, { label: "Airport & navigation", value: -(game.lastCosts * 0.21), type: "cost" }];
  return <section className="finance-layout"><div className="metric-grid finance-metrics"><MetricCard label="Weekly revenue" value={formatMoney(game.lastRevenue)} change={`${game.passengers.toLocaleString()} passengers carried`} icon={CircleDollarSign} tone="positive"/><MetricCard label="Operating costs" value={formatMoney(game.lastCosts)} change={`${Math.round(game.lastCosts / Math.max(1, game.passengers))} per passenger`} icon={Building2}/><MetricCard label="Operating result" value={formatMoney(game.lastProfit)} change={`${((game.lastProfit / game.lastRevenue) * 100).toFixed(1)}% margin`} icon={TrendingUp} tone={game.lastProfit >= 0 ? "positive" : "warning"}/></div><article className="panel pnl-panel"><div className="panel-heading"><div><span className="panel-eyebrow">MANAGEMENT ACCOUNTS</span><h2>Weekly profit & loss</h2></div><span>Week {game.week}</span></div><div className="pnl-lines">{lines.map((line) => <div key={line.label}><span>{line.label}</span><strong className={line.type}>{formatMoney(line.value)}</strong></div>)}<div className="pnl-total"><span>Operating profit</span><strong>{formatMoney(game.lastProfit)}</strong></div></div></article></section>;
}

export default function AirlineGame() {
  const [game, setGame] = useState<AirlineState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<"opening" | "setup" | "game" | "exited">("opening");
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => { const stored = window.localStorage.getItem(STORAGE_KEY); if (stored) try { setGame(JSON.parse(stored)); } catch { window.localStorage.removeItem(STORAGE_KEY); } setLoaded(true); }, []);
  useEffect(() => { if (game && loaded) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); }, [game, loaded]);
  const gameDate = useMemo(() => game ? new Date(2026, 8, 6 + (game.week - 1) * 7).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" }) : "", [game]);
  const advanceWeek = () => {
    if (!game) return;
    const nextWeek = game.week + 1, demandWave = Math.sin(nextWeek * 1.47) * 2.8, operationalNoise = Math.cos(nextWeek * .91) * 1.9;
    const nextLoad = Math.max(42, Math.min(94, Math.round(game.loadFactor + 1.4 + demandWave))), nextOnTime = Math.max(81, Math.min(98.5, game.onTime + operationalNoise)), fuelIndex = Math.max(92, Math.min(124, game.fuelIndex + Math.sin(nextWeek) * 2.1));
    const sectors = game.route.weeklyFlights * 2, passengers = Math.round(sectors * game.aircraft.seats * (nextLoad / 100)), revenue = passengers * game.route.baseFare * game.strategy.fareMultiplier, fuelCost = sectors * game.route.distance * game.aircraft.fuelBurn * 10.8 * (fuelIndex / 100), costs = fuelCost + game.aircraft.monthlyLease / 4.33 + sectors * 31_000 + 690_000 + (nextOnTime < 87 ? 210_000 : 0), profit = revenue - costs;
    setGame({ ...game, week: nextWeek, cash: game.cash + profit, reputation: Math.max(0, Math.min(100, game.reputation + (nextOnTime >= 90 ? 1 : -1))), loadFactor: nextLoad, onTime: nextOnTime, aircraftCondition: Math.max(72, game.aircraftCondition - .65), fuelIndex, lastRevenue: revenue, lastCosts: costs, lastProfit: profit, passengers });
    toast(profit >= 0 ? `Week ${nextWeek} closed with ${formatMoney(profit)} operating profit` : `Week ${nextWeek} closed with a ${formatMoney(profit)} loss`, { description: `${passengers.toLocaleString()} passengers · ${nextLoad}% load factor` });
  };
  if (!loaded) return <div className="loading-screen"><PlaneTakeoff/><span>Preparing operations</span></div>;
  if (screen === "opening") return <><OpeningMenu game={game} onContinue={() => game && setScreen("game")} onNewCareer={() => setScreen("setup")} onExit={() => setScreen("exited")}/><Toaster position="bottom-right"/></>;
  if (screen === "exited") return <main className="exit-screen" style={{ "--opening-background": `url('${PUBLIC_BASE_PATH}/opening-airport-dusk.png')` } as React.CSSProperties}><Brand/><div><span>SESSION PAUSED</span><h1>Thank you for playing.</h1><p>Your progress is safe. You can close this tab or return to the main menu.</p><Button className="gold-button" onClick={() => setScreen("opening")}>Return to main menu</Button></div></main>;
  if (screen === "setup") return <><FounderSetup onBack={() => setScreen("opening")} onLaunch={(state) => { setGame(state); setScreen("game"); toast.success(`${state.airlineName} is cleared for launch`); }}/><Toaster position="bottom-right"/></>;
  if (!game) return <OpeningMenu game={null} onContinue={() => undefined} onNewCareer={() => setScreen("setup")} onExit={() => setScreen("exited")}/>;
  return <div className="game-shell"><aside className={`game-sidebar ${mobileNav ? "mobile-open" : ""}`}><div className="sidebar-brand"><Brand/><Button variant="ghost" size="icon" className="close-mobile" onClick={() => setMobileNav(false)}><X/></Button></div><div className="airline-identity"><span className="airline-monogram">{game.iata}</span><div><strong>{game.airlineName}</strong><small>{game.iata} / {game.icao} · {game.hub.code}</small></div></div><nav>{navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setMobileNav(false); }}><item.icon/><span>{item.label}</span>{view === item.id && <i/>}</button>)}</nav><div className="sidebar-section"><span>OPERATIONS</span><button disabled><Users/><span>People</span><em>SOON</em></button><button disabled><Globe2/><span>Market intelligence</span><em>SOON</em></button></div><div className="sidebar-bottom"><div className="status-card"><div><span>SIMULATION HEALTH</span><i/></div><strong>All systems normal</strong><small>Autosaved moments ago</small></div><button><Settings/><span>Game settings</span></button></div></aside>{mobileNav && <button aria-label="Close navigation" className="sidebar-scrim" onClick={() => setMobileNav(false)}/>}<div className="game-main"><header className="topbar"><div className="topbar-title"><Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileNav(true)}><Menu/></Button><div><span>{navItems.find((item) => item.id === view)?.label}</span><strong>{game.airlineName}</strong></div></div><div className="sim-controls"><div className="sim-date"><CalendarDays/><span>WEEK {game.week}</span><strong>{gameDate}</strong></div><div className="speed-control"><button className={speed === 0 ? "active" : ""} onClick={() => setSpeed(0)}>Ⅱ</button>{[1,2,4].map((item) => <button key={item} className={speed === item ? "active" : ""} onClick={() => setSpeed(item)}>{item}×</button>)}</div><Button className="advance-button" onClick={advanceWeek}><Play/>Advance 7 days</Button></div></header><main className="dashboard"><div className="dashboard-header"><div><span className="dashboard-kicker">FOUNDER CAREER · YEAR 1</span><h1>{view === "overview" ? "Good evening, Chief Executive." : navItems.find((item) => item.id === view)?.label}</h1><p>{view === "overview" ? `Operations are stable at ${game.hub.name}. Here is your latest executive picture.` : `Week ${game.week} · ${game.hub.code} headquarters`}</p></div><div className="market-ticker"><div><Fuel/><span>JET FUEL</span><strong>{game.fuelIndex.toFixed(1)}</strong><small className={game.fuelIndex > 105 ? "up" : "down"}>{game.fuelIndex > 105 ? "▲" : "▼"} 1.8%</small></div><div><Zap/><span>USD / ZAR</span><strong>17.68</strong><small className="down">▼ 0.4%</small></div></div></div>{view === "overview" && <Overview game={game}/>} {view === "network" && <NetworkView game={game}/>} {view === "fleet" && <FleetView game={game}/>} {view === "finance" && <FinanceView game={game}/>}</main></div><Toaster position="bottom-right" richColors/></div>;
}
