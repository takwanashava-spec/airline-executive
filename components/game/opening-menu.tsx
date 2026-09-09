"use client";

import { useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ChevronRight,
  FilePlus2,
  Gamepad2,
  LogOut,
  Monitor,
  Play,
  Settings,
  Volume2,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/game-data";
import type { AirlineState } from "@/types/game";

const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function OpeningMenu({
  game,
  onContinue,
  onNewCareer,
  onExit,
}: {
  game: AirlineState | null;
  onContinue: () => void;
  onNewCareer: () => void;
  onExit: () => void;
}) {
  const [music, setMusic] = useState(true);
  const [effects, setEffects] = useState(true);

  const careerDate = game
    ? new Date(2026, 8, 6 + (game.week - 1) * 7).toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main
      className="opening-screen"
      style={
        {
          "--opening-background": `url('${PUBLIC_BASE_PATH}/opening-airport-dusk.png')`,
        } as CSSProperties
      }
    >
      <div className="opening-backdrop" />
      <div className="opening-shade" />

      <header className="opening-header">
        <Brand />

        <div className="opening-edition">
          <span>FOUNDER EDITION</span>
          <b>BUILD 0.1.0</b>
        </div>
      </header>

      <section className="opening-menu" aria-label="Main menu">
        <div className="opening-title">
          <span>AIRLINE MANAGEMENT SIMULATION</span>

          <h1>
            Your airline.
            <br />
            Your legacy.
          </h1>

          <p>Build the network. Master the operation. Lead from the front.</p>
        </div>

        <div className="menu-actions">
          <Button
            className="menu-primary"
            disabled={!game}
            onClick={onContinue}
          >
            <Play />

            <span>
              <b>Continue career</b>
              <small>
                {game
                  ? `${game.airlineName} · Week ${game.week}`
                  : "No active career"}
              </small>
            </span>

            <ChevronRight />
          </Button>

          <Button
            variant="ghost"
            className="menu-secondary"
            onClick={onNewCareer}
          >
            <FilePlus2 />

            <span>
              <b>New career</b>
              <small>Build an airline from the ground up</small>
            </span>

            <ChevronRight />
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="menu-secondary compact">
                <Settings />

                <span>
                  <b>Settings</b>
                </span>

                <ChevronRight />
              </Button>
            </DialogTrigger>

            <DialogContent className="opening-dialog">
              <DialogHeader>
                <DialogTitle>Game settings</DialogTitle>

                <DialogDescription>
                  Adjust the opening experience. More game settings will be
                  added as the simulation expands.
                </DialogDescription>
              </DialogHeader>

              <div className="settings-list">
                <div>
                  <span>
                    <Volume2 />
                    Menu music
                  </span>

                  <Switch checked={music} onCheckedChange={setMusic} />
                </div>

                <div>
                  <span>
                    <Gamepad2 />
                    Interface sounds
                  </span>

                  <Switch checked={effects} onCheckedChange={setEffects} />
                </div>

                <div>
                  <span>
                    <Monitor />
                    Display mode
                  </span>

                  <b>Automatic</b>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="menu-secondary compact quiet"
            onClick={onExit}
          >
            <LogOut />

            <span>
              <b>Exit game</b>
            </span>
          </Button>
        </div>
      </section>

      {game && (
        <aside className="career-card">
          <div className="career-card-top">
            <span>ACTIVE CAREER</span>
            <i />
          </div>

          <div className="career-airline">
            <b>{game.iata}</b>

            <div>
              <strong>{game.airlineName}</strong>
              <small>
                {game.hub.city} · {game.strategy.name}
              </small>
            </div>
          </div>

          <dl>
            <div>
              <dt>Game date</dt>
              <dd>{careerDate}</dd>
            </div>

            <div>
              <dt>Cash</dt>
              <dd>{formatMoney(game.cash)}</dd>
            </div>

            <div>
              <dt>Fleet</dt>
              <dd>1 aircraft</dd>
            </div>

            <div>
              <dt>Network</dt>
              <dd>1 route</dd>
            </div>
          </dl>

          <button onClick={onContinue}>
            Open command centre <ArrowRight />
          </button>
        </aside>
      )}

      <footer className="opening-footer">
        <span>© 2026 AIRLINE EXECUTIVE</span>
        <span>AN EARLY PLAYABLE FOUNDATION</span>
      </footer>
    </main>
  );
}
