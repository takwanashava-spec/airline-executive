"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, ClipboardCheck, FileSearch, MapPin, Plane, Wrench } from "lucide-react";
import { ManufacturerLogo } from "@/components/game/manufacturer-logo";
import { Button } from "@/components/ui/button";
import { aircraftManufacturers, formatMoney, type AircraftManufacturerId } from "@/lib/game-data";
import { usedAircraftListings, type UsedAircraftListing } from "@/lib/game/used-aircraft";
import type { AirlineState } from "@/types/game";

type MarketSection = "browse" | "watchlist" | "transactions";
type DossierTab = "overview" | "technical" | "maintenance" | "history" | "commercial";

function activeListing(game: AirlineState, listing: UsedAircraftListing) {
  return !game.usedAircraftTransactions.some((item) => item.listingId === listing.id && ["delivery", "completed"].includes(item.status));
}

export function UsedAircraftMarket({ game, onInspect, onOffer, onFinance, onBuy, onWatchlist }: {
  game: AirlineState;
  onInspect: (listingId: string, type: "records" | "physical") => void;
  onOffer: (listingId: string, amount: number) => void;
  onFinance: (listingId: string) => void;
  onBuy: (listingId: string) => void;
  onWatchlist: (listingId: string) => void;
}) {
  const [section, setSection] = useState<MarketSection>("browse");
  const [manufacturer, setManufacturer] = useState<AircraftManufacturerId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<DossierTab>("overview");
  const available = useMemo(() => usedAircraftListings.filter((listing) => activeListing(game, listing)), [game]);
  const selected = usedAircraftListings.find((listing) => listing.id === selectedId) ?? null;

  const openDossier = (listing: UsedAircraftListing) => { setSelectedId(listing.id); setTab("overview"); };
  const watched = (id: string) => game.usedAircraftWatchlist.includes(id);
  const inspected = (id: string) => game.inspectedUsedAircraft.includes(id);
  const isExpired = (listing: UsedAircraftListing) => Date.parse(game.gameDateTime) >= Date.parse(listing.expiresAt);
  const hasActiveDeal = (id: string) => game.usedAircraftTransactions.some((item) => item.listingId === id && ["pending", "accepted", "countered", "delivery"].includes(item.status));

  if (selected) {
    const revealed = inspected(selected.id);
    const components = Object.entries(selected.components);
    return <div className="used-dossier">
      <div className="manufacturer-showroom-nav"><button type="button" onClick={() => setSelectedId(null)}><ChevronLeft />Back to listings</button><span>{selected.registration} · {selected.serialNumber}</span></div>
      <header className="used-dossier-hero">
        <div className="market-aircraft-icon"><Plane /></div>
        <div><span>PRE-OWNED AIRCRAFT DOSSIER</span><h2>{selected.aircraft.model}</h2><p>{selected.manufactureYear} · {selected.seats} seats · {selected.location}</p></div>
        <button type="button" className={watched(selected.id) ? "watched" : ""} onClick={() => onWatchlist(selected.id)}>{watched(selected.id) ? <BookmarkCheck /> : <Bookmark />}{watched(selected.id) ? "Watching" : "Watchlist"}</button>
      </header>
      <div className="dossier-tabs">{(["overview", "technical", "maintenance", "history", "commercial"] as DossierTab[]).map((item) => <button type="button" key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>

      {tab === "overview" && <div className="dossier-panel-grid"><article><span>IDENTITY</span><dl><div><dt>Registration</dt><dd>{selected.registration}</dd></div><div><dt>Serial number</dt><dd>{selected.serialNumber}</dd></div><div><dt>Year</dt><dd>{selected.manufactureYear}</dd></div><div><dt>Configuration</dt><dd>{selected.seats} passengers</dd></div></dl></article><article><span>CURRENT CUSTODY</span><dl><div><dt>Seller</dt><dd>{selected.seller}</dd></div><div><dt>Location</dt><dd>{selected.location}</dd></div><div><dt>Former operator</dt><dd>{selected.formerOperator}</dd></div><div><dt>Availability</dt><dd>Immediate</dd></div></dl></article></div>}
      {tab === "technical" && <article className="dossier-section"><div className="dossier-section-heading"><div><span>TECHNICAL CONDITION</span><h3>{revealed ? "Independent inspection findings" : "Seller-declared condition"}</h3></div>{!revealed && <em>Component detail requires inspection</em>}</div><div className="component-condition-grid">{components.map(([name, value]) => <div key={name}><span>{name.replace(/([A-Z])/g, " $1")}</span><strong>{revealed ? `${value}%` : "Not verified"}</strong><i><b style={{ width: revealed ? `${value}%` : "0%" }} /></i></div>)}</div></article>}
      {tab === "maintenance" && <div className="dossier-panel-grid"><article><span>MAINTENANCE STATUS</span><dl><div><dt>Last major check</dt><dd>{selected.maintenance.lastCheck}</dd></div><div><dt>Next major check</dt><dd>{selected.maintenance.nextCheck}</dd></div><div><dt>Estimated check cost</dt><dd>{formatMoney(selected.maintenance.nextCheckCost)}</dd></div><div><dt>Records status</dt><dd>{revealed ? "Reviewed" : "Not independently verified"}</dd></div></dl></article><article className="inspection-callout"><Wrench /><h3>Pre-purchase inspection</h3><p>A records review takes one game day. A physical inspection takes three days and provides the strongest protection against undisclosed defects.</p><div><Button variant="outline" onClick={() => onInspect(selected.id, "records")}>Records review · {formatMoney(180_000)}</Button><Button onClick={() => onInspect(selected.id, "physical")}>Physical inspection · {formatMoney(850_000)}</Button></div></article></div>}
      {tab === "history" && <article className="dossier-section"><div className="dossier-section-heading"><div><span>OPERATIONAL HISTORY</span><h3>Utilisation and ownership</h3></div></div><div className="history-metrics"><div><span>FORMER OPERATOR</span><strong>{selected.formerOperator}</strong></div><div><span>FLIGHT HOURS</span><strong>{selected.flightHours.toLocaleString()}</strong></div><div><span>FLIGHT CYCLES</span><strong>{selected.flightCycles.toLocaleString()}</strong></div><div><span>AVERAGE HOURS/YEAR</span><strong>{Math.round(selected.flightHours / Math.max(1, 2026 - selected.manufactureYear)).toLocaleString()}</strong></div></div></article>}
      {tab === "commercial" && <div className="dossier-commercial"><article><span>ASKING PRICE</span><strong>{formatMoney(selected.askingPrice)}</strong><small>Market estimate {formatMoney(selected.marketValue)} · delivery {formatMoney(selected.deliveryCost)}</small><small>Listing expires {new Date(selected.expiresAt).toLocaleDateString("en-ZA", { timeZone: "UTC" })}</small></article><div className="dossier-actions"><Button variant="outline" disabled={hasActiveDeal(selected.id) || isExpired(selected)} onClick={() => { const value = window.prompt(`Enter an offer below or equal to ${formatMoney(selected.askingPrice)}`); if (value !== null) onOffer(selected.id, Number(value.replace(/[^0-9.]/g, ""))); }}>Make an offer</Button><Button variant="outline" disabled={hasActiveDeal(selected.id) || isExpired(selected)} onClick={() => onFinance(selected.id)}>Apply for finance</Button><Button className="gold-button" disabled={hasActiveDeal(selected.id) || isExpired(selected)} onClick={() => window.confirm(`Purchase ${selected.registration} for ${formatMoney(selected.askingPrice)} plus delivery?`) && onBuy(selected.id)}>{isExpired(selected) ? "Listing expired" : hasActiveDeal(selected.id) ? "Transaction active" : "Buy at asking price"}</Button></div></div>}
    </div>;
  }

  const manufacturerIds = [...new Set(available.map((listing) => listing.aircraft.manufacturerId))];
  const displayed = section === "watchlist" ? available.filter((listing) => watched(listing.id)) : available.filter((listing) => manufacturer === null || listing.aircraft.manufacturerId === manufacturer);

  return <div className="used-aircraft-market">
    <div className="lessor-market-nav"><button type="button" className={section === "browse" ? "active" : ""} onClick={() => { setSection("browse"); setManufacturer(null); }}><Plane />Browse market</button><button type="button" className={section === "watchlist" ? "active" : ""} onClick={() => { setSection("watchlist"); setManufacturer(null); }}><Bookmark />Watchlist <span>{game.usedAircraftWatchlist.length}</span></button><button type="button" className={section === "transactions" ? "active" : ""} onClick={() => { setSection("transactions"); setManufacturer(null); }}><ClipboardCheck />Transactions <span>{game.usedAircraftTransactions.filter((item) => !["reported", "rejected", "withdrawn", "completed"].includes(item.status)).length}</span></button></div>

    {section === "browse" && manufacturer === null ? <div className="manufacturer-directory">{manufacturerIds.map((id) => { const details = aircraftManufacturers.find((item) => item.id === id)!; const listings = available.filter((item) => item.aircraft.manufacturerId === id); return <button type="button" className="manufacturer-directory-card" key={id} onClick={() => setManufacturer(id)}><ManufacturerLogo manufacturerId={id} /><div><span>{details.fullName}</span><h3>Pre-owned inventory</h3><small>{listings.length} individual airframe{listings.length === 1 ? "" : "s"}</small></div><footer><span><strong>{listings.length}</strong> active listings</span><ChevronRight /></footer></button>; })}</div> : null}
    {section === "browse" && manufacturer !== null ? <div className="manufacturer-showroom-nav"><button type="button" onClick={() => setManufacturer(null)}><ChevronLeft />All manufacturers</button><span>Individual aircraft currently offered for sale</span></div> : null}

    {(section === "watchlist" || (section === "browse" && manufacturer !== null)) && <div className="used-listing-grid">{displayed.length ? displayed.map((listing) => <article className="used-listing-card" key={listing.id}><header><span>{listing.registration}</span><button type="button" onClick={() => onWatchlist(listing.id)}>{watched(listing.id) ? <BookmarkCheck /> : <Bookmark />}</button></header><div className="market-aircraft-icon"><Plane /></div><h3>{listing.aircraft.model}</h3><p><MapPin />{listing.location}</p><dl><div><dt>Year</dt><dd>{listing.manufactureYear}</dd></div><div><dt>Hours</dt><dd>{listing.flightHours.toLocaleString()}</dd></div><div><dt>Cycles</dt><dd>{listing.flightCycles.toLocaleString()}</dd></div><div><dt>Condition</dt><dd>{listing.visibleCondition}%</dd></div></dl><div className="used-listing-price"><span>ASKING PRICE</span><strong>{formatMoney(listing.askingPrice)}</strong><small>{formatMoney(listing.deliveryCost)} estimated delivery</small></div><Button className="gold-button" onClick={() => openDossier(listing)}>Open aircraft dossier</Button></article>) : <div className="inbox-empty"><Bookmark /><strong>No aircraft here</strong><span>Add listings to your watchlist or return to the manufacturer directory.</span></div>}</div>}

    {section === "transactions" && <div className="lease-application-list">{game.usedAircraftTransactions.length ? game.usedAircraftTransactions.map((transaction) => { const listing = usedAircraftListings.find((item) => item.id === transaction.listingId); if (!listing) return null; return <article key={transaction.id}><div><span>{transaction.status}</span><h3>{listing.aircraft.model} · {listing.registration}</h3><p>{transaction.kind === "inspection" ? `${transaction.inspectionType} inspection` : transaction.kind}</p></div><dl><div><dt>Amount</dt><dd>{formatMoney(transaction.amount)}</dd></div><div><dt>Submitted</dt><dd>{new Date(transaction.submittedAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</dd></div><div><dt>{transaction.status === "delivery" ? "Delivery" : "Decision"}</dt><dd>{new Date(transaction.deliveryAt ?? transaction.decisionAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</dd></div></dl></article>; }) : <div className="inbox-empty"><FileSearch /><strong>No transactions</strong><span>Inspections, offers, finance applications and deliveries will appear here.</span></div>}</div>}
  </div>;
}
