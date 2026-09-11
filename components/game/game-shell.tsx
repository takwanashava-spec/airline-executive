"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Fuel,
  Globe2,
  LayoutDashboard,
  Menu,
  Mail,
  Plane,
  Route,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { CommandCentre } from "@/components/game/command-centre";
import { FinanceView } from "@/components/game/finance-view";
import { FleetView } from "@/components/game/fleet-view";
import { InboxView } from "@/components/game/inbox-view";
import { NetworkView } from "@/components/game/network-view";
import type { AircraftAcquisitionMethod } from "@/lib/game/fleet";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import type {
  AirlineState,
  GameSpeed,
  View,
} from "@/types/game";

const navItems = [
  { id: "overview" as View, label: "Command centre", icon: LayoutDashboard },
  { id: "network" as View, label: "Network", icon: Route },
  { id: "fleet" as View, label: "Fleet", icon: Plane },
  { id: "finance" as View, label: "Finance", icon: BarChart3 },
  { id: "inbox" as View, label: "Inbox", icon: Mail },
];

export function GameShell({
  game,
  clockSpeed,
  onClockSpeedChange,
  onAcquireAircraft,
  onAuctionBid,
  onLeaseApply,
  onReadMessage,
  onRespondToMessage,
}: {
  game: AirlineState;
  clockSpeed: GameSpeed;
  onClockSpeedChange: (
    speed: GameSpeed,
  ) => void;
  onAcquireAircraft: (
    offerId: string,
    method: AircraftAcquisitionMethod,
  ) => void;
  onAuctionBid: (listingId: string, amount: number) => void;
  onLeaseApply: (offerId: string) => void;
  onReadMessage: (messageId: string) => void;
  onRespondToMessage: (messageId: string, action: "accept" | "revise" | "withdraw", amount?: number) => void;
}) {
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const { gameDate, gameTime } = useMemo(() => {
    const date = new Date(game.gameDateTime);

    return {
      gameDate: date.toLocaleDateString(
        "en-ZA",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        },
      ),
      gameTime: date.toLocaleTimeString(
        "en-ZA",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        },
      ),
    };
  }, [game.gameDateTime]);

  return (
    <div className="game-shell">
      <aside className={`game-sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            className="close-mobile"
            onClick={() => setMobileNav(false)}
          >
            <X />
          </Button>
        </div>

        <div className="airline-identity">
          <span className="airline-monogram">{game.iata}</span>
          <div>
            <strong>{game.airlineName}</strong>
            <small>
              {game.iata} / {game.icao} · {game.hub.code}
            </small>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => {
                setView(item.id);
                setMobileNav(false);
              }}
            >
              <item.icon />
              <span>{item.label}</span>
              {item.id === "inbox" && game.inbox.some((mail) => mail.status === "unread") && <em className="nav-unread">{game.inbox.filter((mail) => mail.status === "unread").length}</em>}
              {view === item.id && <i />}
            </button>
          ))}
        </nav>

        <div className="sidebar-section">
          <span>OPERATIONS</span>
          <button disabled><Users /><span>People</span><em>SOON</em></button>
          <button disabled>
            <Globe2 /><span>Market intelligence</span><em>SOON</em>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="status-card">
            <div><span>SIMULATION HEALTH</span><i /></div>
            <strong>All systems normal</strong>
            <small>Autosaved moments ago</small>
          </div>
          <button><Settings /><span>Game settings</span></button>
        </div>
      </aside>

      {mobileNav && (
        <button
          type="button"
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() => setMobileNav(false)}
        />
      )}

      <div className="game-main">
        <header className="topbar">
          <div className="topbar-title">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              onClick={() => setMobileNav(true)}
            >
              <Menu />
            </Button>

            <div>
              <span>{navItems.find((item) => item.id === view)?.label}</span>
              <strong>{game.airlineName}</strong>
            </div>
          </div>

          <div className="sim-controls">
            <div className="sim-date">
              <CalendarDays />
              <span>WEEK {game.week}</span>
              <strong>
                {gameDate} · {gameTime}
              </strong>
            </div>

            <div
              className="speed-control"
              aria-label="Game clock speed"
            >
              <button
                type="button"
                aria-label="Pause game clock"
                className={
                  clockSpeed === 0 ? "active" : ""
                }
                onClick={() =>
                  onClockSpeedChange(0)
                }
              >
                Ⅱ
              </button>

              {([1, 60, 360] as const).map(
                (speed) => (
                  <button
                    type="button"
                    key={speed}
                    className={
                      clockSpeed === speed
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      onClockSpeedChange(speed)
                    }
                  >
                    {speed}×
                  </button>
                ),
              )}
            </div>
          </div>
        </header>

        <main className="dashboard">
          <div className="dashboard-header">
            <div>
              <span className="dashboard-kicker">FOUNDER CAREER · YEAR 1</span>
              <h1>
                {view === "overview"
                  ? `Good evening, ${game.ceoName}.`
                  : navItems.find((item) => item.id === view)?.label}
              </h1>
              <p>
                {view === "overview"
                  ? game.route
                    ? `Operations are stable at ${game.hub.name}. Here is your latest executive picture.`
                    : `${game.airlineName} is registered at ${game.hub.name}. Build your fleet and network from inside the game.`
                  : `Week ${game.week} · ${game.hub.code} headquarters`}
              </p>
            </div>

            <div className="market-ticker">
              <div>
                <Fuel />
                <span>JET FUEL</span>
                <strong>{game.fuelIndex.toFixed(1)}</strong>
                <small className={game.fuelIndex > 105 ? "up" : "down"}>
                  {game.fuelIndex > 105 ? "▲" : "▼"} 1.8%
                </small>
              </div>
              <div>
                <Zap />
                <span>USD / ZAR</span>
                <strong>17.68</strong>
                <small className="down">▼ 0.4%</small>
              </div>
            </div>
          </div>

          {view === "overview" && <CommandCentre game={game} />}
          {view === "network" && <NetworkView game={game} />}
          {view === "fleet" && (
            <FleetView
              game={game}
              onAcquireAircraft={
                onAcquireAircraft
              }
              onAuctionBid={onAuctionBid}
              onLeaseApply={onLeaseApply}
            />
          )}
          {view === "finance" && <FinanceView game={game} />}
          {view === "inbox" && <InboxView game={game} onRead={onReadMessage} onRespond={onRespondToMessage} />}
        </main>
      </div>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
