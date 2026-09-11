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
  acquireAircraft,
  type AircraftAcquisitionMethod,
} from "@/lib/game/fleet";
import { loadCareer, saveCareer } from "@/lib/game/persistence";
import {
  advanceCareerClock,
  GAME_MINUTES_PER_REAL_SECOND,
} from "@/lib/game/simulation";
import type { AirlineState, GameSpeed } from "@/types/game";
import { markMessageRead, respondToAuctionMessage, submitAuctionBid } from "@/lib/game/auctions";
import { respondToLeaseMessage, submitLeaseApplication } from "@/lib/game/leasing";
import { applyForUsedAircraftFinance, buyUsedAircraftNow, requestUsedAircraftInspection, respondToUsedAircraftMessage, submitUsedAircraftOffer, toggleUsedAircraftWatchlist } from "@/lib/game/used-aircraft";

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

  const handleAcquireAircraft = (
    offerId: string,
    method: AircraftAcquisitionMethod,
  ) => {
    if (!game) return;

    const result = acquireAircraft(
      game,
      offerId,
      method,
    );

    if (result.error || !result.aircraft) {
      toast.error(
        result.error ??
          "The aircraft could not be acquired.",
      );
      return;
    }

    setGame(result.game);

    const action =
      result.aircraft.acquisitionType ===
      "leased"
        ? "leased"
        : result.aircraft.acquisitionType ===
            "financed"
          ? "financed"
          : "purchased";

    toast.success(
      `${result.aircraft.aircraft.model} ${action}`,
      {
        description: `${result.aircraft.registration} has joined the fleet at ${game.hub.code}.`,
      },
    );
  };

  const handleAuctionBid = (listingId: string, amount: number) => {
    if (!game) return;
    const result = submitAuctionBid(game, listingId, amount);
    if (result.error) return void toast.error(result.error);
    setGame(result.game);
    toast.success("Bid submitted", { description: "Confirmation has been sent to your executive inbox." });
  };

  const handleMessageResponse = (messageId: string, action: "accept" | "revise" | "withdraw", amount?: number) => {
    if (!game) return;
    const message = game.inbox.find((item) => item.id === messageId);
    const result = message?.category === "used-aircraft"
      ? respondToUsedAircraftMessage(game, messageId, action, amount)
      : message?.category === "finance"
      ? respondToLeaseMessage(game, messageId, action, amount)
      : respondToAuctionMessage(game, messageId, action, amount);
    if (result.error) return void toast.error(result.error);
    setGame(result.game);
    toast.success(action === "accept" ? "Transaction completed" : action === "revise" ? "Revised bid submitted" : "Correspondence closed");
  };

  const handleLeaseApplication = (offerId: string) => {
    if (!game) return;
    const result = submitLeaseApplication(game, offerId);
    if (result.error) return void toast.error(result.error);
    setGame(result.game);
    toast.success("Lease application submitted", { description: "The lessor will respond through your executive inbox within one game day." });
  };

  const applyUsedResult = (result: { game: AirlineState; error: string | null }, success: string) => {
    if (result.error) return void toast.error(result.error);
    setGame(result.game);
    toast.success(success, { description: "Updates and decisions will be delivered to your executive inbox." });
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
      onAcquireAircraft={
        handleAcquireAircraft
      }
      onAuctionBid={handleAuctionBid}
      onLeaseApply={handleLeaseApplication}
      onUsedInspect={(listingId, type) => applyUsedResult(requestUsedAircraftInspection(game, listingId, type), "Inspection instructed")}
      onUsedOffer={(listingId, amount) => applyUsedResult(submitUsedAircraftOffer(game, listingId, amount), "Offer submitted")}
      onUsedFinance={(listingId) => applyUsedResult(applyForUsedAircraftFinance(game, listingId), "Finance application submitted")}
      onUsedBuy={(listingId) => applyUsedResult(buyUsedAircraftNow(game, listingId), "Purchase completed")}
      onUsedWatchlist={(listingId) => setGame(toggleUsedAircraftWatchlist(game, listingId))}
      onReadMessage={(messageId) => setGame((current) => current ? markMessageRead(current, messageId) : current)}
      onRespondToMessage={handleMessageResponse}
    />
  );
}
