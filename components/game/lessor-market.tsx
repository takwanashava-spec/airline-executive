"use client";

import { useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Clock3, GitCompareArrows, MapPin, Plane, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/game-data";
import { leaseOffers, lessors } from "@/lib/game/leasing";
import type { AirlineState } from "@/types/game";

type LessorSection = "directory" | "compare" | "applications";

function OfferCard({ game, offerId, onApply }: { game: AirlineState; offerId: string; onApply: (offerId: string) => void }) {
  const offer = leaseOffers.find((item) => item.id === offerId)!;
  const application = game.leaseApplications.find((item) => item.offerId === offer.id && item.status !== "withdrawn");
  const upfront = offer.monthlyRate * offer.depositMonths + offer.deliveryCost;

  return <article className="lessor-offer-card">
    <div className="lessor-airframe-heading"><span>{offer.registration}</span><em>{offer.condition}% condition</em></div>
    <div className="market-aircraft-icon"><Plane /></div>
    <h3>{offer.aircraft.model}</h3>
    <p><MapPin />{offer.location}</p>
    <dl>
      <div><dt>Serial number</dt><dd>{offer.serialNumber}</dd></div>
      <div><dt>Year</dt><dd>{offer.manufactureYear}</dd></div>
      <div><dt>Flight hours</dt><dd>{offer.flightHours.toLocaleString()}</dd></div>
      <div><dt>Cycles</dt><dd>{offer.flightCycles.toLocaleString()}</dd></div>
      <div><dt>Lease term</dt><dd>{offer.termMonths} months</dd></div>
      <div><dt>Available</dt><dd>{new Date(offer.availableAt).toLocaleDateString("en-ZA", { timeZone: "UTC" })}</dd></div>
    </dl>
    <div className="lease-cost-stack">
      <div><span>MONTHLY BASIC RENT</span><strong>{formatMoney(offer.monthlyRate)}</strong></div>
      <small>Maintenance reserve {formatMoney(offer.maintenanceReserve)}/month</small>
      <small>{offer.depositMonths}-month deposit · delivery {formatMoney(offer.deliveryCost)}</small>
      <small>Initial cash requirement: {formatMoney(upfront)}</small>
    </div>
    <Button className="gold-button" disabled={Boolean(application)} onClick={() => onApply(offer.id)}>
      {application ? `${application.status[0].toUpperCase()}${application.status.slice(1)}` : "Submit lease application"}
    </Button>
  </article>;
}

export function LessorMarket({ game, onApply }: { game: AirlineState; onApply: (offerId: string) => void }) {
  const [section, setSection] = useState<LessorSection>("directory");
  const [selectedLessor, setSelectedLessor] = useState<string | null>(null);
  const selected = lessors.find((item) => item.id === selectedLessor);

  return <div className="lessor-market">
    <div className="lessor-market-nav">
      <button className={section === "directory" ? "active" : ""} type="button" onClick={() => { setSection("directory"); setSelectedLessor(null); }}><Building2 />Browse lessors</button>
      <button className={section === "compare" ? "active" : ""} type="button" onClick={() => { setSection("compare"); setSelectedLessor(null); }}><GitCompareArrows />Compare offers</button>
      <button className={section === "applications" ? "active" : ""} type="button" onClick={() => { setSection("applications"); setSelectedLessor(null); }}><Clock3 />My applications <span>{game.leaseApplications.filter((item) => item.status === "pending").length}</span></button>
    </div>

    {section === "directory" && !selected ? <div className="lessor-directory">
      {lessors.map((lessor) => {
        const inventory = leaseOffers.filter((offer) => offer.lessorId === lessor.id);
        return <button type="button" className="lessor-directory-card" key={lessor.id} onClick={() => setSelectedLessor(lessor.id)}>
          <div className="lessor-brand-mark"><Building2 /><span>{lessor.name.split(" ").map((word) => word[0]).join("").slice(0, 3)}</span></div>
          <div><span>{lessor.region}</span><h3>{lessor.name}</h3><p><MapPin />{lessor.headquarters}</p><small>{lessor.specialisation}</small></div>
          <footer><span><ShieldCheck />{lessor.riskProfile} underwriting</span><strong>{inventory.length} aircraft <ChevronRight /></strong></footer>
        </button>;
      })}
    </div> : null}

    {section === "directory" && selected ? <>
      <div className="manufacturer-showroom-nav"><button type="button" onClick={() => setSelectedLessor(null)}><ChevronLeft />All lessors</button><span>{selected.name} · {selected.headquarters}</span></div>
      <div className="lessor-profile-strip"><div><span>HEADQUARTERS</span><strong>{selected.headquarters}</strong></div><div><span>SPECIALISATION</span><strong>{selected.specialisation}</strong></div><div><span>UNDERWRITING</span><strong>{selected.riskProfile}</strong></div></div>
      <div className="lessor-offer-grid">{leaseOffers.filter((offer) => offer.lessorId === selected.id).map((offer) => <OfferCard key={offer.id} game={game} offerId={offer.id} onApply={onApply} />)}</div>
    </> : null}

    {section === "compare" ? <div className="lease-comparison-wrap"><table className="lease-comparison"><thead><tr><th>Aircraft</th><th>Lessor and location</th><th>Condition</th><th>Monthly rent</th><th>Reserve</th><th>Deposit</th><th>Delivery</th><th>Term</th><th /></tr></thead><tbody>{leaseOffers.map((offer) => {
      const lessor = lessors.find((item) => item.id === offer.lessorId)!;
      const applied = game.leaseApplications.some((item) => item.offerId === offer.id && item.status !== "withdrawn");
      return <tr key={offer.id}><td><strong>{offer.aircraft.model}</strong><small>{offer.registration} · {offer.manufactureYear}</small></td><td><strong>{lessor.name}</strong><small>{offer.location}</small></td><td>{offer.condition}%</td><td>{formatMoney(offer.monthlyRate)}</td><td>{formatMoney(offer.maintenanceReserve)}</td><td>{offer.depositMonths} months</td><td>{formatMoney(offer.deliveryCost)}</td><td>{offer.termMonths} mo.</td><td><Button size="sm" disabled={applied} onClick={() => onApply(offer.id)}>{applied ? "Applied" : "Apply"}</Button></td></tr>;
    })}</tbody></table></div> : null}

    {section === "applications" ? <div className="lease-application-list">
      {game.leaseApplications.length === 0 ? <div className="inbox-empty"><Clock3 /><strong>No lease applications</strong><span>Applications submitted to lessors will be tracked here.</span></div> : game.leaseApplications.map((application) => {
        const offer = leaseOffers.find((item) => item.id === application.offerId);
        const lessor = lessors.find((item) => item.id === offer?.lessorId);
        if (!offer || !lessor) return null;
        return <article key={application.id}><div><span>{application.status}</span><h3>{offer.aircraft.model} · {offer.registration}</h3><p>{lessor.name}</p></div><dl><div><dt>Proposed rent</dt><dd>{formatMoney(application.proposedMonthlyRate)}</dd></div><div><dt>Submitted</dt><dd>{new Date(application.submittedAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</dd></div><div><dt>Decision due</dt><dd>{new Date(application.decisionAt).toLocaleString("en-ZA", { timeZone: "UTC" })}</dd></div></dl></article>;
      })}
    </div> : null}
  </div>;
}
