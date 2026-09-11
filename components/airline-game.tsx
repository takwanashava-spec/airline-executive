"use client";

import { useEffect, useRef, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { toast } from "sonner";

import { FounderSetup } from "@/components/founder/founder-setup";
import { ExitScreen } from "@/components/game/exit-screen";
import { GameShell } from "@/components/game/game-shell";
import { OpeningMenu } from "@/components/game/opening-menu";
import { Toaster } from "@/components/ui/sonner";
import {
  purchaseAircraft,
} from "@/lib/game/fleet";
import { loadCareer, saveCareer } from "@/lib/game/persistence";
import {
  advanceCareerClock,
  GAME_MINUTES_PER_REAL_SECOND,
} from "@/lib/game/simulation";
import type { AirlineState, GameSpeed } from "@/types/game";

type Screen = "opening" | "setup" | "game" | "exited";

export default function AirlineGame() {
  const [game, setGame] = useState<AirlineState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("opening");
  const [clockSpeed, setClockSpeed] =
    useState<GameSpeed>(1);
  const lastClockTick = useRef<number | null>(
    null,
  );

  useEffect(() => {
    const savedGame = loadCareer(window.localStorage);

    queueMicrotask(() => {
      setGame(savedGame);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (game && loaded) {
      saveCareer(window.localStorage, game);
    }
  }, [game, loaded]);

  useEffect(() => {
    if (
      screen !== "game" ||
      clockSpeed === 0
    ) {
      lastClockTick.current = null;
      return;
    }

    lastClockTick.current = Date.now();

    const timer = window.setInterval(() => {
      const now = Date.now();
      const previous =
        lastClockTick.current ?? now;
      const realSeconds = Math.max(
        0,
        (now - previous) / 1_000,
      );

      lastClockTick.current = now;

      setGame((currentGame) =>
        currentGame
          ? advanceCareerClock(
              currentGame,
              realSeconds *
                GAME_MINUTES_PER_REAL_SECOND *
                clockSpeed,
            )
          : currentGame,
      );
    }, 1_000);

    return () => {
      window.clearInterval(timer);
      lastClockTick.current = null;
    };
  }, [clockSpeed, screen]);

  const handlePurchaseAircraft = (
    model: string,
  ) => {
    if (!game) return;

    const result = purchaseAircraft(
      game,
      model,
    );

    if (result.error || !result.aircraft) {
      toast.error(
        result.error ??
          "The aircraft could not be purchased.",
      );
      return;
    }

    setGame(result.game);

    toast.success(
      `${result.aircraft.aircraft.model} purchased`,
      {
        description: `${result.aircraft.registration} has joined the fleet at ${game.hub.code}.`,
      },
    );
  };

  if (!loaded) {
    return (
      <div className="loading-screen">
        <PlaneTakeoff />
        <span>Preparing operations</span>
      </div>
    );
  }

  if (screen === "opening") {
    return (
      <>
        <OpeningMenu
          game={game}
          onContinue={() => game && setScreen("game")}
          onNewCareer={() => setScreen("setup")}
          onExit={() => setScreen("exited")}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (screen === "exited") {
    return <ExitScreen onReturn={() => setScreen("opening")} />;
  }

  if (screen === "setup") {
    return (
      <>
        <FounderSetup
          onBack={() => setScreen("opening")}
          onLaunch={(state) => {
            setGame(state);
            setScreen("game");
            toast.success(`${state.airlineName} is registered`);
          }}
        />
        <Toaster position="bottom-right" />
      </>
    );
  }

  if (!game) {
    return (
      <OpeningMenu
        game={null}
        onContinue={() => undefined}
        onNewCareer={() => setScreen("setup")}
        onExit={() => setScreen("exited")}
      />
    );
  }

  return (
    <GameShell
      game={game}
      clockSpeed={clockSpeed}
      onClockSpeedChange={setClockSpeed}
      onPurchaseAircraft={
        handlePurchaseAircraft
      }
    />
  );
}
