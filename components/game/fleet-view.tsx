"use client";

import { CalendarDays, Gauge, Plane, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";

import { formatMoney } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function FleetView({ game }: { game: AirlineState }) {
  return (
    <section className="module-grid">
      <article className="panel aircraft-detail">
        <div className="aircraft-banner">
          <div className="plane-large"><Plane /></div>

          <div>
            <span className="panel-eyebrow">{game.icao}-001 · ACTIVE</span>
            <h2>{game.aircraft.model}</h2>
            <p>
              {game.aircraft.family} · {game.aircraft.seats} seats · Delivered
              Aug 2026
            </p>
          </div>
        </div>

        <div className="spec-grid">
          <div>
            <span>RANGE</span>
            <strong>{game.aircraft.range.toLocaleString()} km</strong>
          </div>
          <div>
            <span>CRUISE SPEED</span>
            <strong>{game.aircraft.cruiseSpeed.toLocaleString()} km/h</strong>
          </div>
          <div>
            <span>TURNAROUND</span>
            <strong>{game.aircraft.turnaround} min</strong>
          </div>
          <div>
            <span>RELIABILITY</span>
            <strong>{game.aircraft.reliability}%</strong>
          </div>
          <div>
            <span>LEASE / MONTH</span>
            <strong>{formatMoney(game.aircraft.monthlyLease)}</strong>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading compact">
          <div>
            <span className="panel-eyebrow">ENGINEERING</span>
            <h2>Technical condition</h2>
          </div>
          <span className="status-on-time">SERVICEABLE</span>
        </div>

        <div className="health-ring">
          <div
            style={
              { "--health": `${game.aircraftCondition * 3.6}deg` } as CSSProperties
            }
          >
            <span>{game.aircraftCondition.toFixed(1)}%</span>
            <small>AIRFRAME</small>
          </div>
        </div>

        <div className="maintenance-list">
          <div>
            <span><Gauge />A-check forecast</span>
            <strong>184 flight hours</strong>
          </div>
          <div>
            <span><ShieldCheck />Open defects</span>
            <strong>0 MEL items</strong>
          </div>
          <div>
            <span><CalendarDays />Next inspection</span>
            <strong>28 Sep 2026</strong>
          </div>
        </div>
      </article>
    </section>
  );
}
