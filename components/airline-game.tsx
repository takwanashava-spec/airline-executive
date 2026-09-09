"use client";

import { useEffect, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import { toast } from "sonner";

import { FounderSetup } from "@/components/founder/founder-setup";
import { ExitScreen } from "@/components/game/exit-screen";
import { GameShell } from "@/components/game/game-shell";
import { OpeningMenu } from "@/components/game/opening-menu";
import { Toaster } from "@/components/ui/sonner";
import { formatMoney } from "@/lib/game-data";
import { loadCareer, saveCareer } from "@/lib/game/persistence";
import { advanceCareerWeek } from "@/lib/game/simulation";
import type { AirlineState } from "@/types/game";

type Screen = "opening" | "setup" | "game" | "exited";

export default function AirlineGame() {
  const [game, setGame] = useState<AirlineState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("opening");

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

  const advanceWeek = () => {
    if (!game) return;

    const result = advanceCareerWeek(game);
    setGame(result.game);

    toast(
      result.profit >= 0
        ? `Week ${result.week} closed with ${formatMoney(
            result.profit,
          )} operating profit`
        : `Week ${result.week} closed with a ${formatMoney(
            result.profit,
          )} loss`,
      {
        description: `${result.passengers.toLocaleString()} passengers · ${result.loadFactor}% load factor`,
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
            toast.success(`${state.airlineName} is cleared for launch`);
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

  return <GameShell game={game} onAdvanceWeek={advanceWeek} />;
}
