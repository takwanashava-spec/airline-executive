"use client";

import { Building2, CircleDollarSign, TrendingUp } from "lucide-react";

import { MetricCard } from "@/components/game/command-centre";
import { formatMoney } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

export function FinanceView({ game }: { game: AirlineState }) {
  const leaseCost = game.aircraft
    ? game.aircraft.monthlyLease / 4.33
    : 0;
  const margin = game.lastRevenue
    ? (game.lastProfit / game.lastRevenue) * 100
    : 0;

  const lines = [
    { label: "Passenger revenue", value: game.lastRevenue, type: "income" },
    { label: "Fuel & emissions", value: -(game.lastCosts * 0.34), type: "cost" },
    {
      label: "Aircraft lease",
      value: -leaseCost,
      type: "cost",
    },
    { label: "Crew & operations", value: -(game.lastCosts * 0.27), type: "cost" },
    {
      label: "Airport & navigation",
      value: -(game.lastCosts * 0.21),
      type: "cost",
    },
  ];

  return (
    <section className="finance-layout">
      <div className="metric-grid finance-metrics">
        <MetricCard
          label="Weekly revenue"
          value={formatMoney(game.lastRevenue)}
          change={
            game.route
              ? `${game.passengers.toLocaleString()} passengers carried`
              : "Operations have not started"
          }
          icon={CircleDollarSign}
          tone={game.lastRevenue > 0 ? "positive" : "default"}
        />
        <MetricCard
          label="Operating costs"
          value={formatMoney(game.lastCosts)}
          change={
            game.passengers
              ? `${Math.round(
                  game.lastCosts / game.passengers,
                )} per passenger`
              : "No operating costs recorded"
          }
          icon={Building2}
        />
        <MetricCard
          label="Operating result"
          value={formatMoney(game.lastProfit)}
          change={`${margin.toFixed(1)}% margin`}
          icon={TrendingUp}
          tone={game.lastProfit >= 0 ? "positive" : "warning"}
        />
      </div>

      <article className="panel pnl-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">MANAGEMENT ACCOUNTS</span>
            <h2>Weekly profit & loss</h2>
          </div>
          <span>Week {game.week}</span>
        </div>

        <div className="pnl-lines">
          {lines.map((line) => (
            <div key={line.label}>
              <span>{line.label}</span>
              <strong className={line.type}>{formatMoney(line.value)}</strong>
            </div>
          ))}

          <div className="pnl-total">
            <span>Operating profit</span>
            <strong>{formatMoney(game.lastProfit)}</strong>
          </div>
        </div>
      </article>
    </section>
  );
}
